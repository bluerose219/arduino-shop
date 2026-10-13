import type { Metadata } from "next";

export const metadata: Metadata = { title: "이미지 출처" };

const LICENSE_URL: Record<string, string> = {
  CC0: "https://creativecommons.org/publicdomain/zero/1.0/",
  "CC BY 2.0": "https://creativecommons.org/licenses/by/2.0/",
  "CC BY-SA 2.0": "https://creativecommons.org/licenses/by-sa/2.0/",
  "CC BY-SA 3.0": "https://creativecommons.org/licenses/by-sa/3.0/",
  "CC BY-SA 4.0": "https://creativecommons.org/licenses/by-sa/4.0/",
};

// [사용처, 원본 URL, 저작자, 라이선스]
const CREDITS: [string, string, string, string][] = [
  ["아두이노 우노 R3 · 카테고리(보드)", "https://commons.wikimedia.org/wiki/File:Arduino_Uno_-_R3.jpg", "SparkFun Electronics", "CC BY 2.0"],
  ["아두이노 나노", "https://commons.wikimedia.org/wiki/File:Arduino_Nano_V3.0.JPG", "Mauricio V. Genta", "CC0"],
  ["아두이노 메가 2560", "https://commons.wikimedia.org/wiki/File:Arduino_MEGA_2560_R3,_front_side.jpg", "Dsimic", "CC BY-SA 4.0"],
  ["ESP32 개발보드", "https://commons.wikimedia.org/wiki/File:ESP32_Espressif_ESP-WROOM-32_Dev_Board.jpg", "Ubahnverleih", "CC0"],
  ["HC-SR04 · 카테고리(센서)", "https://commons.wikimedia.org/wiki/File:HC_SR04_Ultrasonic_Module.jpg", "Suyash Dwivedi", "CC BY-SA 4.0"],
  ["DHT11", "https://commons.wikimedia.org/wiki/File:Dht11.jpg", "Edwiyanto", "CC BY-SA 4.0"],
  ["HC-SR501", "https://commons.wikimedia.org/wiki/File:PIR_motion_sensor_for_Arduino_oblique_view.jpg", "Sjilla", "CC BY-SA 4.0"],
  ["CdS 조도센서", "https://commons.wikimedia.org/wiki/File:GL5528_photoresistors_01.jpg", "Retired electrician", "CC0"],
  ["SG90 서보모터 · 카테고리(모듈)", "https://commons.wikimedia.org/wiki/File:Tower_Pro_SG90_micro_servo_motor.jpg", "Suyash Dwivedi", "CC BY-SA 4.0"],
  ["릴레이 모듈", "https://commons.wikimedia.org/wiki/File:SRD-05VDC-SL-C_5V_one-channel_relay_module.jpg", "Suyash Dwivedi", "CC BY-SA 4.0"],
  ["1602 LCD", "https://commons.wikimedia.org/wiki/File:16x2_Character_LCD_Display.jpg", "oomlout", "CC BY-SA 2.0"],
  ["L298N 모터드라이버", "https://www.flickr.com/photos/45703688@N07/20061691276", "lespounder", "CC BY-SA 2.0"],
  ["브레드보드 · 카테고리(부품)", "https://commons.wikimedia.org/wiki/File:BREB-02_(14335226011).jpg", "oomlout", "CC BY-SA 2.0"],
  ["점퍼 케이블", "https://commons.wikimedia.org/wiki/File:A_few_Jumper_Wires.jpg", "oomlout", "CC BY-SA 2.0"],
  ["LED 키트", "https://commons.wikimedia.org/wiki/File:LED_Rainbow_Pack_-_5mm_PTH_12903-01.jpg", "SparkFun Electronics", "CC BY 2.0"],
  ["스타터 키트 · 카테고리(키트)", "https://commons.wikimedia.org/wiki/File:ARDX_-_Arduino_Experimentation_Kit_(Inside_the_box).jpg", "oomlout", "CC BY-SA 2.0"],
  ["메인 배너", "https://commons.wikimedia.org/wiki/File:Arduino_Lab_(52489362).jpeg", "Max Witt", "CC BY-SA 3.0"],
];

export default function CreditsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold">이미지 출처</h1>
      <p className="mt-2 text-sm text-gray-500">
        이 사이트의 사진은 모두 자유 라이선스 사진이며, 크기 조정 외에는 수정하지 않았습니다.
      </p>
      <div className="card mt-6 overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">사용처</th>
              <th className="px-4 py-3 font-medium">저작자</th>
              <th className="px-4 py-3 font-medium">라이선스</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {CREDITS.map(([usage, source, author, license]) => (
              <tr key={source}>
                <td className="px-4 py-2.5">
                  <a href={source} target="_blank" rel="noreferrer" className="hover:underline">
                    {usage}
                  </a>
                </td>
                <td className="px-4 py-2.5">{author}</td>
                <td className="px-4 py-2.5">
                  <a href={LICENSE_URL[license]} target="_blank" rel="noreferrer" className="text-brand-700 hover:underline">
                    {license}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
