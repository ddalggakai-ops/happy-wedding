#!/usr/bin/env python3
"""
분리된 소스(index.html + css + js)를 하나의 self-contained HTML로 합칩니다.

사용법:
    python3 build-single.py                # dist/index.html 생성 (기본 경로 유지)
    python3 build-single.py --repo-assets  # 기존 저장소 이미지 경로에 맞춰 생성

--repo-assets 옵션은 이미지 경로를 아래와 같이 바꿉니다.
    assets/images/main.jpg          ->  assets/cover.jpg
    assets/images/gallery_01.jpg    ->  assets/gallery/01.jpg  (01~12)

즉 happy-wedding 저장소에 이미 올라가 있는 사진을 그대로 사용하므로,
생성된 index.html 한 개만 업로드하면 사이트가 동작합니다.
"""
import re
import sys
import pathlib

ROOT = pathlib.Path(__file__).parent
OUT_DIR = ROOT / "dist"
USE_REPO_ASSETS = False  # 이 소스는 이미 저장소 이미지 경로를 사용합니다

# 기존 저장소(happy-wedding)에 올라가 있는 갤러리 이미지 장수
REPO_GALLERY_COUNT = 18


def read(rel: str) -> str:
    return (ROOT / rel).read_text(encoding="utf-8")


def build() -> str:
    html = read("index.html")
    css = read("css/style.css")
    # CSS를 HTML에 인라인하면 기준 경로가 css/ 에서 문서 위치로 바뀌므로 보정
    css = css.replace('url("../assets/', 'url("assets/')
    config_js = read("js/config.js")
    storage_js = read("js/storage.js")
    main_js = read("js/main.js")

    if USE_REPO_ASSETS:
        # 메인 사진 경로 교체 (og:image, 인트로 img, 카카오 공유 폴백까지)
        html = html.replace("assets/images/main.jpg", "assets/cover.jpg")
        config_js = config_js.replace("assets/images/main.jpg", "assets/cover.jpg")
        main_js = main_js.replace("assets/images/main.jpg", "assets/cover.jpg")

        # 갤러리 배열을 저장소 경로(assets/gallery/01.jpg ~ 12.jpg)로 교체
        new_list = "\n".join(
            f'      "assets/gallery/{i:02d}.jpg",' for i in range(1, REPO_GALLERY_COUNT + 1)
        )
        # 주의: re.sub의 치환 문자열은 \n, \1 같은 이스케이프를 해석하므로
        #      반드시 lambda로 넘겨 원본 텍스트를 그대로 넣습니다.
        replacement = f"    images: [\n{new_list}\n    ],"
        config_js = re.sub(
            r'    images: \[\n.*?\n    \],',
            lambda _m: replacement,
            config_js,
            flags=re.S,
        )

    # <link rel="stylesheet" href="css/style.css"> -> 인라인 <style>
    style_block = f"\n  <style>\n{css}\n  </style>"
    html = re.sub(
        r'\s*<link rel="stylesheet" href="css/style\.css(?:\?[^"]*)?"\s*/?>',
        lambda _m: style_block,
        html,
    )

    # 로컬 <script src="js/*.js"> -> 인라인 <script> (카카오 CDN은 그대로 둠)
    bundle = "\n".join(
        [
            "  <script>",
            config_js,
            storage_js,
            main_js,
            "  </script>",
        ]
    )
    script_block = "\n" + bundle
    html = re.sub(
        r'\s*<script src="js/config\.js(?:\?[^"]*)?"></script>\s*'
        r'<script src="js/storage\.js(?:\?[^"]*)?"></script>\s*'
        r'<script src="js/main\.js(?:\?[^"]*)?"></script>',
        lambda _m: script_block,
        html,
    )
    return html


def main() -> None:
    out = build()

    # 합쳐지지 않고 남은 참조가 있으면 알려줍니다.
    leftovers = re.findall(r'(?:href|src)="(?:css|js)/[^"]+"', out)
    if leftovers:
        print("⚠ 인라인 처리되지 않은 참조:", leftovers)

    # 인라인된 JS 문법 검사 (node가 있으면)
    import shutil, subprocess, tempfile
    if shutil.which("node"):
        m = re.search(r"<script>\n(.*?)\n  </script>", out, re.S)
        if m:
            with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False) as fp:
                fp.write(m.group(1))
                tmp = fp.name
            r = subprocess.run(["node", "--check", tmp], capture_output=True, text=True)
            if r.returncode != 0:
                print("✗ 인라인 JS 문법 오류:\n" + r.stderr[:600])
                raise SystemExit(1)
            print("✓ 인라인 JS 문법 검사 통과")

    OUT_DIR.mkdir(exist_ok=True)
    target = OUT_DIR / "index.html"
    target.write_text(out, encoding="utf-8")

    mode = "저장소 이미지 경로" if USE_REPO_ASSETS else "기본 경로"
    print(f"✓ {target} 생성 완료 ({mode}, {len(out) // 1024}KB)")


if __name__ == "__main__":
    main()
