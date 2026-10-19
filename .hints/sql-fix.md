-- 绕过 email rate limit：把已注册但未验证的用户全部标记为已确认
update auth.users
set email_confirmed_at = now()
where email_confirmed_at is null;
```

**截图给我**（我帮你看正确的 Confirm email 开关位置在哪里）
