// 嵌入式主题的签库 —— 抽题/抽项目
export const DRAW_ITEMS = [
  { type: "project", title: "点亮 LED 灯", difficulty: "入门", desc: "用 Arduino 或 STM32 让板载 LED 闪烁，理解 GPIO 输出。", icon: "💡" },
  { type: "project", title: "按键控制 LED", difficulty: "入门", desc: "读取按键输入，控制 LED 亮灭，加入消抖。", icon: "🔘" },
  { type: "project", title: "PWM 呼吸灯", difficulty: "入门", desc: "用 PWM 实现 LED 渐变亮度，理解占空比。", icon: "🌬️" },
  { type: "project", title: "蜂鸣器播放旋律", difficulty: "入门", desc: "用 PWM 驱动无源蜂鸣器，演奏一段小曲。", icon: "🎵" },
  { type: "project", title: "串口打印 Hello", difficulty: "入门", desc: "配置 UART，用串口助手收发消息。", icon: "📟" },
  { type: "project", title: "I2C 读取温湿度", difficulty: "入门", desc: "用 AHT20 / DHT20 传感器读环境温湿度。", icon: "🌡️" },
  { type: "project", title: "SPI 驱动 OLED", difficulty: "进阶", desc: "用 0.96 寸 OLED 显示中文/图形。", icon: "🖥️" },
  { type: "project", title: "舵机控制器", difficulty: "进阶", desc: "用 PWM 驱动 SG90，做个机械臂动作。", icon: "🦾" },
  { type: "project", title: "直流电机 PID 调速", difficulty: "进阶", desc: "编码器测速 + PID 算法闭环控制电机转速。", icon: "⚙️" },
  { type: "project", title: "FreeRTOS 多任务", difficulty: "进阶", desc: "创建两个任务，一个读传感器一个点灯。", icon: "🧵" },
  { type: "project", title: "LVGL 图形界面", difficulty: "进阶", desc: "在屏幕/模拟器上做按钮、滑块、动画。", icon: "🎨" },
  { type: "project", title: "ESP32 WiFi 联网", difficulty: "进阶", desc: "连上家里的 WiFi，从浏览器控制 LED。", icon: "📶" },
  { type: "project", title: "ESP32 BLE 通信", difficulty: "进阶", desc: "和手机 App 蓝牙通信，做个无线开关。", icon: "🅱️" },
  { type: "project", title: "MQTT 上云", difficulty: "进阶", desc: "用 ESP32 把传感器数据发到 MQTT 服务器。", icon: "☁️" },
  { type: "project", title: "摄像头 + 显示屏", difficulty: "进阶", desc: "ESP32-CAM 取流，LCD 实时显示画面。", icon: "📷" },
  { type: "project", title: "SD 卡数据记录", difficulty: "进阶", desc: "把传感器数据写入 SD 卡，做离线记录仪。", icon: "💾" },
  { type: "project", title: "PCB 设计实战", difficulty: "高阶", desc: "用 KiCad / 立创 EDA 画一块自己的开发板。", icon: "🔌" },
  { type: "project", title: "Bootloader 升级", difficulty: "高阶", desc: "实现 IAP / OTA 远程固件升级。", icon: "🚀" },
  { type: "project", title: "USB HID 设备", difficulty: "高阶", desc: "把开发板模拟成键盘/鼠标，做个自动按键器。", icon: "⌨️" },
  { type: "project", title: "CAN 总线通信", difficulty: "高阶", desc: "两块板子通过 CAN 总线互发数据。", icon: "🔗" },
  { type: "project", title: "LVGL + SquareLine", difficulty: "高阶", desc: "用 SquareLine Studio 拖拽设计嵌入式 UI。", icon: "🪟" },
  { type: "project", title: "嵌入式 Linux 移植", difficulty: "高阶", desc: "Buildroot / Yocto 编译最小 Linux 镜像。", icon: "🐧" },
  { type: "project", title: "FPGA 跑马灯", difficulty: "高阶", desc: "用 Verilog 在 FPGA 上实现 LED 流水灯。", icon: "🔲" },
  { type: "project", title: "示波器看 PWM 波形", difficulty: "入门", desc: "用示波器观察 LED 引脚 PWM 实际波形。", icon: "📈" },
  { type: "project", title: "逻辑分析仪抓 I2C", difficulty: "进阶", desc: "用逻辑分析仪抓取并解析 I2C 通信数据。", icon: "🔍" },
  { type: "project", title: "PCB 焊接实战", difficulty: "入门", desc: "从元器件识别到 QFN/BGA 手工焊接练习。", icon: "🔧" },
  { type: "project", title: "拆个旧家电", difficulty: "入门", desc: "拆一个废旧的电子产品，认识常见电路模块。", icon: "🔨" },
  { type: "project", title: "万用表测三极管", difficulty: "入门", desc: "用万用表二极管档判别三极管管脚和类型。", icon: "🧪" },
  { type: "project", title: "DIY 充电宝", difficulty: "入门", desc: "用 18650 + 保护板 + DC-DC 升压模块做一个。", icon: "🔋" },
  { type: "project", title: "音频功放", difficulty: "进阶", desc: "用 TPA3116 或 LM386 做一个立体声小功放。", icon: "🔊" },
  { type: "project", title: "智能家居联动", difficulty: "进阶", desc: "用 ESP32 + Home Assistant 控制家里的灯。", icon: "🏠" },
] as const;

export type DrawItem = (typeof DRAW_ITEMS)[number];

// 按难度分组
export const DIFFICULTY_COLORS: Record<string, string> = {
  "入门": "hsl(150 60% 45%)",
  "进阶": "hsl(220 75% 55%)",
  "高阶": "hsl(0 70% 55%)",
};
