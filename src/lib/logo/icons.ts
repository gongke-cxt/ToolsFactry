import type { IconDef, Industry } from '@/types/logo'

// Simplified geometric SVG icons per industry — single/dual path, 24x24 viewBox
export const ICONS: IconDef[] = [
  // technology
  { id: 'tech-chip', name: '芯片', category: 'technology', viewBox: '0 0 24 24', paths: ['M9 3H5a2 2 0 00-2 2v4m0 6v4a2 2 0 002 2h4m6 0h4a2 2 0 002-2v-4m0-6V5a2 2 0 00-2-2h-4M9 9h6v6H9z'] },
  { id: 'tech-code', name: '代码', category: 'technology', viewBox: '0 0 24 24', paths: ['M8 6L3 12l5 6M16 6l5 6-5 6'] },
  { id: 'tech-cloud', name: '云', category: 'technology', viewBox: '0 0 24 24', paths: ['M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z'] },
  { id: 'tech-signal', name: '信号', category: 'technology', viewBox: '0 0 24 24', paths: ['M2 20h.01M7 20v-4M12 20v-8M17 20V8M22 20V4'] },
  { id: 'tech-monitor', name: '显示器', category: 'technology', viewBox: '0 0 24 24', paths: ['M3 5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM8 21h8M12 17v4'] },

  // food
  { id: 'food-hat', name: '厨师帽', category: 'food', viewBox: '0 0 24 24', paths: ['M6 13a4 4 0 01-.88-7.9A5 5 0 0115.9 6 4 4 0 0118 13H6zM6 13v5a2 2 0 002 2h8a2 2 0 002-2v-5'] },
  { id: 'food-utensil', name: '餐具', category: 'food', viewBox: '0 0 24 24', paths: ['M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20M21 15V2v0a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7'] },
  { id: 'food-leaf', name: '叶子', category: 'food', viewBox: '0 0 24 24', paths: ['M11 20A7 7 0 019.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.8 10-10 10zM2 21c0-3 1.9-5.5 4.5-6.3'] },
  { id: 'food-cup', name: '杯子', category: 'food', viewBox: '0 0 24 24', paths: ['M17 8h1a4 4 0 010 8h-1M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8zM6 2v3M10 2v3M14 2v3'] },
  { id: 'food-flame', name: '火焰', category: 'food', viewBox: '0 0 24 24', paths: ['M12 12c-2-2.7-.5-5.3 0-6 1 1.3 3 3.3 3 6a3 3 0 11-6 0c0-2 1.5-3.5 3-5z'] },

  // health
  { id: 'health-heart', name: '心跳', category: 'health', viewBox: '0 0 24 24', paths: ['M3 12h4l3-9 4 18 3-9h4'] },
  { id: 'health-cross', name: '医疗', category: 'health', viewBox: '0 0 24 24', paths: ['M12 2v20M2 12h20'] },
  { id: 'health-shield', name: '盾牌', category: 'health', viewBox: '0 0 24 24', paths: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'] },
  { id: 'health-leaf', name: '药叶', category: 'health', viewBox: '0 0 24 24', paths: ['M12 22c4-4 8-7.6 8-12a8 8 0 10-16 0c0 4.4 4 8 8 12z', 'M12 22V8M8 12l4-4 4 4'] },

  // education
  { id: 'edu-grad', name: '学士帽', category: 'education', viewBox: '0 0 24 24', paths: ['M22 10L12 5 2 10l10 5 10-5zM6 12v5c3 3 9 3 12 0v-5'] },
  { id: 'edu-book', name: '书本', category: 'education', viewBox: '0 0 24 24', paths: ['M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5V5a2.5 2.5 0 012.5-2.5H20v15H6.5A2.5 2.5 0 004 19.5z'] },
  { id: 'edu-bulb', name: '灯泡', category: 'education', viewBox: '0 0 24 24', paths: ['M9 21h6M12 3a6 6 0 00-4 10.5V17h8v-3.5A6 6 0 0012 3z'] },
  { id: 'edu-pencil', name: '铅笔', category: 'education', viewBox: '0 0 24 24', paths: ['M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z'] },

  // finance
  { id: 'fin-chart', name: '图表', category: 'finance', viewBox: '0 0 24 24', paths: ['M22 12h-4l-3 9L9 3l-3 9H2'] },
  { id: 'fin-coins', name: '硬币', category: 'finance', viewBox: '0 0 24 24', paths: ['M12 2a10 10 0 100 20 10 10 0 000-20zM12 6v12M8 10h8M8 14h8'] },
  { id: 'fin-diamond', name: '钻石', category: 'finance', viewBox: '0 0 24 24', paths: ['M6 3l-4 7 10 12L22 10l-4-7H6z'] },
  { id: 'fin-pillar', name: '柱子', category: 'finance', viewBox: '0 0 24 24', paths: ['M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6'] },

  // retail
  { id: 'retail-bag', name: '购物袋', category: 'retail', viewBox: '0 0 24 24', paths: ['M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0'] },
  { id: 'retail-tag', name: '标签', category: 'retail', viewBox: '0 0 24 24', paths: ['M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01'] },
  { id: 'retail-star', name: '星星', category: 'retail', viewBox: '0 0 24 24', paths: ['M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'] },
  { id: 'retail-gift', name: '礼物', category: 'retail', viewBox: '0 0 24 24', paths: ['M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 110-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 100-5C13 2 12 7 12 7z'] },

  // creative
  { id: 'art-palette', name: '调色板', category: 'creative', viewBox: '0 0 24 24', paths: ['M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.5-.7 1.5-1.5 0-.4-.1-.7-.4-1-.3-.3-.4-.7-.4-1.1 0-.8.7-1.5 1.5-1.5H16c3.3 0 6-2.7 6-6 0-5.5-4.5-9-10-9zM6.5 13a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM9 8a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM15 8a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM17.5 13a1.5 1.5 0 110-3 1.5 1.5 0 010 3z'] },
  { id: 'art-brush', name: '画笔', category: 'creative', viewBox: '0 0 24 24', paths: ['M18.37 2.63a2.12 2.12 0 013 3L14 13l-4 1 1-4 7.37-7.37z'] },
  { id: 'art-camera', name: '相机', category: 'creative', viewBox: '0 0 24 24', paths: ['M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11zM12 17a4 4 0 100-8 4 4 0 000 8z'] },
  { id: 'art-music', name: '音符', category: 'creative', viewBox: '0 0 24 24', paths: ['M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zM21 16a3 3 0 11-6 0 3 3 0 016 0z'] },

  // sports
  { id: 'sport-trophy', name: '奖杯', category: 'sports', viewBox: '0 0 24 24', paths: ['M6 9H4a2 2 0 01-2-2V5a2 2 0 012-2h2M18 9h2a2 2 0 002-2V5a2 2 0 00-2-2h-2M6 3h12v7a6 6 0 01-12 0V3zM8 21h8M12 17v4'] },
  { id: 'sport-flame', name: '火炬', category: 'sports', viewBox: '0 0 24 24', paths: ['M13 2L7 14h4l-1 8 6-12h-4l1-8z'] },
  { id: 'sport-target', name: '靶心', category: 'sports', viewBox: '0 0 24 24', paths: ['M12 22a10 10 0 100-20 10 10 0 000 20zM12 16a4 4 0 100-8 4 4 0 000 8zM12 12h.01'] },

  // nature
  { id: 'nat-tree', name: '树', category: 'nature', viewBox: '0 0 24 24', paths: ['M12 22v-8M5 14l7-12 7 12H5z'] },
  { id: 'nat-leaf', name: '树叶', category: 'nature', viewBox: '0 0 24 24', paths: ['M17 8C8 10 5.9 16.2 3.8 21M17 8l4-4M17 8c0 5-3 8.5-7 11'] },
  { id: 'nat-mountain', name: '山', category: 'nature', viewBox: '0 0 24 24', paths: ['M8 3l4 8 5-4 5 13H2L8 3z'] },
  { id: 'nat-water', name: '水', category: 'nature', viewBox: '0 0 24 24', paths: ['M2 6c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0'] },

  // travel
  { id: 'travel-plane', name: '飞机', category: 'travel', viewBox: '0 0 24 24', paths: ['M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z'] },
  { id: 'travel-compass', name: '指南针', category: 'travel', viewBox: '0 0 24 24', paths: ['M12 22a10 10 0 100-20 10 10 0 000 20zM16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z'] },
  { id: 'travel-globe', name: '地球', category: 'travel', viewBox: '0 0 24 24', paths: ['M12 22a10 10 0 100-20 10 10 0 000 20zM2 12h20M12 2a15 15 0 014 10 15 15 0 01-4 10 15 15 0 01-4-10 15 15 0 014-10z'] },
  { id: 'travel-pin', name: '地图钉', category: 'travel', viewBox: '0 0 24 24', paths: ['M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8zM12 10a2 2 0 100-4 2 2 0 000 4z'] },

  // legal
  { id: 'legal-scales', name: '天平', category: 'legal', viewBox: '0 0 24 24', paths: ['M12 3v18M2 7h20M4 7l3 7h6l3-7'] },
  { id: 'legal-gavel', name: '法槌', category: 'legal', viewBox: '0 0 24 24', paths: ['M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z'] },
  { id: 'legal-shield', name: '法律盾牌', category: 'legal', viewBox: '0 0 24 24', paths: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4'] },

  // beauty
  { id: 'beauty-scissors', name: '剪刀', category: 'beauty', viewBox: '0 0 24 24', paths: ['M6 9a3 3 0 100-6 3 3 0 000 6zM6 21a3 3 0 100-6 3 3 0 000 6zM20 4L8.3 15.7M20 20L8.3 8.3'] },
  { id: 'beauty-diamond', name: '宝石', category: 'beauty', viewBox: '0 0 24 24', paths: ['M6 3h12l4 6-10 13L2 9l4-6zM2 9h20'] },
  { id: 'beauty-flower', name: '花', category: 'beauty', viewBox: '0 0 24 24', paths: ['M12 7.5a4.5 4.5 0 11-4.5 4.5M12 7.5A4.5 4.5 0 1016.5 12M12 12v9M7 8l5 4M17 8l-5 4'] },

  // automotive
  { id: 'auto-car', name: '汽车', category: 'automotive', viewBox: '0 0 24 24', paths: ['M5 17h14M5 17a2 2 0 01-2-2V9l2-5h10l2 5v6a2 2 0 01-2 2M5 17a2 2 0 100 4 2 2 0 000-4zM19 17a2 2 0 100 4 2 2 0 000-4zM3 9h18'] },
  { id: 'auto-gear', name: '齿轮', category: 'automotive', viewBox: '0 0 24 24', paths: ['M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z'] },
  { id: 'auto-road', name: '公路', category: 'automotive', viewBox: '0 0 24 24', paths: ['M4 20L8 4M20 20L16 4M12 6v2M12 12v2M12 18v2'] },

  // realestate
  { id: 'home', name: '房屋', category: 'realestate', viewBox: '0 0 24 24', paths: ['M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10'] },
  { id: 'building', name: '大楼', category: 'realestate', viewBox: '0 0 24 24', paths: ['M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4M9 10h.01M15 10h.01M9 14h.01M15 14h.01'] },
  { id: 'key', name: '钥匙', category: 'realestate', viewBox: '0 0 24 24', paths: ['M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zM15 9l-3.51 3.51'] },

  // other (generic)
  { id: 'generic-star', name: '星星', category: 'other', viewBox: '0 0 24 24', paths: ['M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'] },
  { id: 'generic-hexagon', name: '六边形', category: 'other', viewBox: '0 0 24 24', paths: ['M12 2l8.66 5v10L12 22l-8.66-5V7L12 2z'] },
  { id: 'generic-circle', name: '圆形', category: 'other', viewBox: '0 0 24 24', paths: ['M12 22a10 10 0 100-20 10 10 0 000 20z'] },
]

export function getIconsByIndustry(industry: Industry): IconDef[] {
  return ICONS.filter(i => i.category === industry)
}
