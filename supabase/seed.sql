-- =============================================================================
-- Firmware 嵌入式开发社 — Seed Data
-- Run AFTER 0001_init.sql and after at least one user has registered.
-- =============================================================================

-- Sample blog posts (3)
insert into public.blog_posts (id, slug, title, excerpt, cover_url, body_md, author_id, published_at)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'welcome',
    '欢迎加入 Firmware 嵌入式开发社',
    '社团简介、学习路线、活动安排一文了解。',
    null,
    E'# 欢迎来到 Firmware 嵌入式开发社\n\n我们是一个专注于嵌入式系统开发的高中社团，涵盖 **STM32、Arduino、ESP32、嵌入式 Linux、RTOS** 等方向。\n\n## 学习路线建议\n\n1. C 语言基础 → 指针、内存、结构体\n2. 单片机入门 → Arduino / STM32 HAL\n3. RTOS → FreeRTOS 任务调度\n4. 嵌入式 Linux → 树莓派、驱动入门\n\n## 活动安排\n\n- 每周一次社团活动（周五课后）\n- 不定期的项目分享和工作坊\n- 每学期一次的成果展示\n\n关注本日志和论坛获取最新通知。\n',
    (select id from public.profiles order by created_at asc limit 1),
    now() - interval '7 days'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'stm32-hal',
    'STM32 HAL 库快速上手',
    '从零开始用 CubeMX 创建一个闪烁 LED 工程。',
    null,
    E'# STM32 HAL 快速上手\n\n## 准备\n\n- STM32 开发板（推荐 NUCLEO-F103RB）\n- STM32CubeMX\n- Keil / STM32CubeIDE\n\n## 步骤\n\n1. 打开 CubeMX，选择芯片\n2. 配置 `PC13` 为 `GPIO_Output`\n3. 在 `Project` 设置中生成代码\n4. 在 `main.c` 中加入：\n\n```c\nwhile (1) {\n  HAL_GPIO_TogglePin(GPIOC, GPIO_PIN_13);\n  HAL_Delay(500);\n}\n```\n\n5. 编译烧录，看到 LED 闪烁\n',
    (select id from public.profiles order by created_at asc limit 1),
    now() - interval '3 days'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'esp32-compare',
    'ESP32 上 Arduino 与 ESP-IDF 的选择',
    '两种主流开发方式对比，帮你选对工具链。',
    null,
    E'# ESP32：Arduino vs ESP-IDF\n\n| 维度 | Arduino | ESP-IDF |\n|---|---|---|\n| 上手难度 | 极低 | 中等 |\n| 性能 | 较低 | 高 |\n| 库生态 | 丰富 | 官方为主 |\n\n## 建议\n- 入门/原型：Arduino\n- 深入学习：ESP-IDF',
    (select id from public.profiles order by created_at asc limit 1),
    now() - interval '1 day'
  )
on conflict (id) do nothing;

-- Sample members (5)
insert into public.members (id, name, avatar_url, grade, major, tags, bio, github_url, sort_order)
values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    '张三',
    null,
    '高二',
    null,
    array['STM32','RTOS'],
    '主攻 STM32 和 FreeRTOS，喜欢画 PCB。',
    'https://github.com/zhangsan',
    0
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    '李四',
    null,
    '高一',
    null,
    array['ESP32','Arduino'],
    '做智能小车和物联网小项目。',
    null,
    1
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3',
    '王五',
    null,
    '高三',
    null,
    array['嵌入式Linux'],
    '折腾树莓派和嵌入式 Linux。',
    'https://github.com/wangwu',
    2
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4',
    '赵六',
    null,
    '高二',
    null,
    array['FPGA','PCB'],
    '玩 ZYNQ 和高速 PCB 设计。',
    null,
    3
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5',
    '钱七',
    null,
    '高一',
    null,
    array['Arduino','STM32'],
    '刚入坑，在学 C 语言和单片机。',
    null,
    4
  )
on conflict (id) do nothing;
