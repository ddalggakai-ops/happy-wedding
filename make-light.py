#!/usr/bin/env python3
"""사진과 음악을 가볍게 다시 저장합니다 (화질은 눈에 띄지 않을 만큼만 양보).

  python3 make-light.py           # 얼마나 줄어드는지 보기만 (파일은 그대로)
  python3 make-light.py --apply   # 실제로 덮어쓰기

줄어드는 원리
  · 사진(JPG)  : 화질 78로 다시 저장 + 점진적 표시(progressive)로 바꿔 빨리 보이게
  · 그림(PNG)  : 색 수를 줄여 저장 (배경이 비치는 오려낸 사진도 그대로 유지)
  · 음악(MP3)  : 배경음악이라 모노 56kbps면 충분

덮어쓰기 전에 원본은 assets/_원본백업/ 으로 옮겨 보관합니다.
"""
import fnmatch
import os
import shutil
import subprocess
import sys

from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(ROOT, "assets")
BACKUP = os.path.join(ASSETS, "_원본백업")
APPLY = "--apply" in sys.argv

JPEG_QUALITY = 78
MAX_LONG_SIDE = 1620          # 이보다 큰 사진은 줄입니다 (화면에서 이 이상 쓰이지 않음)
MIN_BYTES = 40 * 1024         # 40KB 미만은 건드리지 않습니다
MIN_GAIN = 0.10               # 10% 이상 줄어들 때만 바꿉니다
SKIP_DIRS = {"_원본백업", "_oldbg", "video"}

# 파일별 예외 규칙 (위에서부터 처음 맞는 것 하나만 적용)
#   quality  : JPEG 화질            blur    : 저장 전 아주 약한 뭉갬(노이즈 많은 사진에 효과)
#   width    : 가로 폭을 이 값으로  colors  : PNG 색 수
OVERRIDES = [
    # 오려낸 어린 시절 사진 — 색 수를 줄이면 얼굴에 얼룩이 생겨서 손대지 않습니다
    ("assets/parents/*baby*.png", {"skip": True}),
    # 배경 무늬라 화면에서 작게 깔립니다 — 폭 640이면 충분
    ("assets/paper-dark.jpg",     {"width": 640, "quality": 60}),
    # 필름 느낌 사진이라 알갱이가 많아 잘 안 줄어듭니다 — 아주 약하게 다듬고 저장
    ("assets/letter-*.jpg",       {"blur": 0.4, "quality": 74}),
    ("assets/gallery/*.jpg",      {"blur": 0.4, "quality": 76}),
    ("assets/calendar.jpg",       {"quality": 72}),
]


def rules_for(rel):
    key = rel.replace(os.sep, "/")
    for pat, opts in OVERRIDES:
        if fnmatch.fnmatch(key, pat):
            return opts
    return {}


def human(n):
    return f"{n/1024:,.0f}KB"


def shrink_image(src, dst, opts=None):
    """줄인 결과를 dst에 쓰고 바이트 수를 돌려줍니다."""
    opts = opts or {}
    if opts.get("skip"):
        return None
    im = Image.open(src)
    fmt = (im.format or "").upper()
    w, h = im.size

    if opts.get("width") and w > opts["width"]:
        nw = opts["width"]
        im = im.resize((nw, round(h * nw / w)), Image.LANCZOS)
    elif max(w, h) > MAX_LONG_SIDE:
        r = MAX_LONG_SIDE / max(w, h)
        im = im.resize((round(w * r), round(h * r)), Image.LANCZOS)

    if fmt in ("JPEG", "JPG"):
        im = im.convert("RGB")
        if opts.get("blur"):
            im = im.filter(ImageFilter.GaussianBlur(opts["blur"]))
        im.save(dst, "JPEG", quality=opts.get("quality", JPEG_QUALITY),
                optimize=True, progressive=True)
    elif fmt == "PNG":
        colors = opts.get("colors", 256)
        has_alpha = im.mode in ("RGBA", "LA") or "transparency" in im.info
        if has_alpha:
            im = im.convert("RGBA").quantize(colors=colors, method=Image.FASTOCTREE)
        else:
            im = im.convert("P", palette=Image.ADAPTIVE, colors=colors)
        im.save(dst, "PNG", optimize=True)
    else:
        return None
    return os.path.getsize(dst)


def shrink_audio(src, dst):
    if shutil.which("ffmpeg") is None:
        return None
    r = subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", src,
                        "-ac", "1", "-b:a", "56k", "-map_metadata", "-1", dst],
                       capture_output=True)
    return os.path.getsize(dst) if r.returncode == 0 and os.path.exists(dst) else None


def main():
    targets = []
    for dirpath, dirnames, files in os.walk(ASSETS):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for f in sorted(files):
            p = os.path.join(dirpath, f)
            if os.path.getsize(p) < MIN_BYTES:
                continue
            if f.lower().endswith((".jpg", ".jpeg", ".png", ".mp3")):
                targets.append(p)

    tmpdir = os.path.join(ROOT, "_light_tmp")
    os.makedirs(tmpdir, exist_ok=True)
    before = after = 0
    changed = []

    for p in targets:
        rel = os.path.relpath(p, ROOT)
        size0 = os.path.getsize(p)
        tmp = os.path.join(tmpdir, rel.replace(os.sep, "__"))
        try:
            size1 = (shrink_audio(p, tmp) if p.lower().endswith(".mp3")
                     else shrink_image(p, tmp, rules_for(rel)))
        except Exception as e:
            print(f"  건너뜀 {rel} ({e})")
            continue
        if not size1:
            continue
        before += size0
        after += min(size0, size1)
        if size1 < size0 * (1 - MIN_GAIN):
            changed.append((rel, size0, size1, tmp))
            print(f"  {human(size0):>9} → {human(size1):>9}  ({(1-size1/size0)*100:4.0f}% 절감)  {rel}")

    total_gain = sum(a - b for _, a, b, _ in changed)
    print(f"\n바꿀 파일 {len(changed)}개 · 절감 {human(total_gain)}"
          f" (전체 {human(before)} → {human(before - total_gain)})")

    if not APPLY:
        print("\n실제로 적용하려면:  python3 make-light.py --apply")
        return

    os.makedirs(BACKUP, exist_ok=True)
    for rel, _, _, tmp in changed:
        keep = os.path.join(BACKUP, rel.replace(os.sep, "__"))
        shutil.copy2(os.path.join(ROOT, rel), keep)
        shutil.copy2(tmp, os.path.join(ROOT, rel))
    print(f"\n✓ {len(changed)}개 적용 완료 — 원본은 {os.path.relpath(BACKUP, ROOT)} 에 보관했습니다")
    print("  사진 크기가 바뀌었으니 python3 make-sizes.py 도 한 번 실행해주세요")


if __name__ == "__main__":
    main()
