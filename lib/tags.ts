export const FORUM_TAGS = [
  "STM32",
  "Arduino",
  "ESP32",
  "嵌入式Linux",
  "RTOS",
  "工具链",
  "杂谈",
] as const;

export type ForumTag = (typeof FORUM_TAGS)[number];

export const MEMBER_TAGS = [
  "STM32",
  "Arduino",
  "ESP32",
  "嵌入式Linux",
  "RTOS",
  "FPGA",
  "PCB",
  "算法",
  "前端",
  "后端",
] as const;

export type MemberTag = (typeof MEMBER_TAGS)[number];
