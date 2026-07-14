export type ShootingLocation = {
  name: string;
  mapUrl: string;
};

/**
 * 当日の星空コンディションに応じて案内する、主な撮影候補地。
 * 確定場所ではなく、お客様に開催エリアの目安を伝えるために使用する。
 */
export const shootingLocations: ShootingLocation[] = [
  {
    name: "前浜",
    mapUrl: "https://maps.app.goo.gl/w5t9SFKB2XPkWXHU9?g_st=ic",
  },
  {
    name: "友利博愛",
    mapUrl: "https://maps.app.goo.gl/cD3yeskG3Usnn5wPA?g_st=ic",
  },
  {
    name: "白鳥岬",
    mapUrl: "https://maps.app.goo.gl/Fxq45hfTpmNtQxpU9?g_st=ic",
  },
];
