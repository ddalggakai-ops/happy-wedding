#!/usr/bin/env python3
"""assets 폴더의 이미지 크기를 모아 js/sizes.js 로 저장합니다.
   브라우저가 사진을 내려받기 전에도 자리를 미리 잡아두어, 스크롤 중 화면이 밀리지 않게 합니다.
   사진을 바꾸거나 추가한 뒤에는 python3 make-sizes.py 를 한 번 실행해주세요."""
import json, os
from PIL import Image

ROOT = os.path.dirname(os.path.abspath(__file__))
EXT = (".jpg", ".jpeg", ".png", ".webp", ".gif")
sizes = {}
for dirpath, _, files in os.walk(os.path.join(ROOT, "assets")):
    for f in sorted(files):
        if not f.lower().endswith(EXT):
            continue
        p = os.path.join(dirpath, f)
        rel = os.path.relpath(p, ROOT).replace(os.sep, "/")
        try:
            with Image.open(p) as im:
                sizes[rel] = [im.width, im.height]
        except Exception:
            pass

out = os.path.join(ROOT, "js", "sizes.js")
with open(out, "w", encoding="utf-8") as fp:
    fp.write("/* 자동 생성 파일 — make-sizes.py 가 만듭니다. 직접 수정하지 마세요.\n")
    fp.write("   사진의 원래 크기를 미리 알려주어, 사진이 늦게 도착해도 화면이 밀리지 않게 합니다. */\n")
    fp.write("window.ASSET_SIZES = " + json.dumps(sizes, ensure_ascii=False, indent=0).replace("\n", "") + ";\n")
print(f"✓ js/sizes.js 생성 — 이미지 {len(sizes)}개")
