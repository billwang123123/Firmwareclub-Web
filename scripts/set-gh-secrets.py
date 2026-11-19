#!/usr/bin/env python3
"""
把本地 .env.local 里的 Supabase 配置写入 GitHub Actions Secrets。
用法：python3 scripts/set-gh-secrets.py
"""
import os
import re
import subprocess
import sys
import json
import base64
import urllib.request
import urllib.error

from nacl import public, encoding

REPO = "billwang123123/Firmwareclub-Web"
ENV_FILE = "/Users/billwang/Downloads/Kilo Project/.env.local"
API = "https://api.github.com"


def get_credentials():
    out = subprocess.run(
        ["git", "credential", "fill"],
        input="protocol=https\nhost=github.com\n\n",
        capture_output=True,
        text=True,
    ).stdout
    creds = {}
    for line in out.strip().splitlines():
        if "=" in line:
            k, v = line.split("=", 1)
            creds[k] = v
    return creds.get("username"), creds.get("password")


def read_env():
    vals = {}
    with open(ENV_FILE) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            vals[k.strip()] = v.strip()
    return vals


def encrypt(plaintext: str, pubkey_b64: str) -> str:
    pk = public.PublicKey(pubkey_b64.encode(), encoding.Base64Encoder())
    box = public.SealedBox(pk)
    sealed = box.encrypt(plaintext.encode())
    return base64.b64encode(sealed).decode()


def api(method, path, token, data=None, headers=None):
    url = path if path.startswith("http") else API + path
    hdrs = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "kilo-setup",
    }
    if headers:
        hdrs.update(headers)
    body = None
    if data is not None:
        body = json.dumps(data).encode()
        hdrs["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=body, headers=hdrs, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            raw = resp.read()
            return resp.status, (json.loads(raw) if raw else None)
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()


def main():
    username, token = get_credentials()
    if not token:
        print("❌ 取不到 GitHub 凭证")
        sys.exit(1)
    print(f"✅ 使用账号 {username}")

    env = read_env()
    url = env.get("NEXT_PUBLIC_SUPABASE_URL")
    key = env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    if not url or not key:
        print("❌ .env.local 里缺少配置")
        sys.exit(1)

    # 拿仓库的 public key
    status, data = api(
        "GET", f"/repos/{REPO}/actions/secrets/public-key", token
    )
    if status != 200:
        print(f"❌ 取 public key 失败 ({status}): {data}")
        sys.exit(1)

    pubkey = data["key"]
    key_id = data["key_id"]

    for name, value in [
        ("SUPABASE_URL", url),
        ("SUPABASE_ANON_KEY", key),
    ]:
        encrypted = encrypt(value, pubkey)
        status, resp = api(
            "PUT",
            f"/repos/{REPO}/actions/secrets/{name}",
            token,
            {"encrypted_value": encrypted, "key_id": key_id},
        )
        if status in (201, 204):
            print(f"✅ Secret '{name}' 已设置")
        else:
            print(f"❌ Secret '{name}' 设置失败 ({status}): {resp}")


if __name__ == "__main__":
    main()
