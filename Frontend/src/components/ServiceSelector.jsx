// Frontend/src/components/ServiceSelector.jsx
import React from "react";

const services = [
  {
    name: "Classic Haircut",
    desc: "Includes a precision haircut and style.",
    price: "$30 - 45 min",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCE6Q2ZaMNk_MNp262pXzgfcMvnG5ppTL2fuMxwUT37GxfADSTTV1h3F_xzW-nv3AFEaZFWZgY9Mu-zzT2yFJZ4RRmPgoUY37J7BBYx6J3I_rpfvsvYD_KE7Gi_ZQwXQWUIdFt1pFnRzaNVRBdFQAgZgH44RlnUDyEHaBBt6hxNXjs4kfa1Ri1LlxI4CZ1_f4FCR-Ya9UUcVLL8PZNZ7RGvWXbDsCI1w14TBQO0SudiF8AmeSvg8_6qKXx02LLGrets1W9arJ37qyA",
  },
  {
    name: "Beard Trim",
    desc: "Detailed beard shaping and trimming.",
    price: "$20 - 30 min",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA_zXjtMY_GmIWLDHJnReOui9n33cr-fbvnfHNrAsAkY2BnrVI822c5LzcFeZMl2YyUPL-BKazi5eLgaIp1Ic-C490ytihUxQZL5g4SuOt5LoVZK5WxztJUQ6XC0QCxCyHPU-zHHSvm4AShcL1pVbrshd4H9JByyj5Wc9-_gBluzRgwY8fX-_Z7HJkyuJ5qmOhj_oji-ZXgyc8QZ6QZeKd23TRfzHTQWqOSkxJzQ2r0ya5YbIEm0xVMio6bH6M5iuORka6c0J3gm-A",
  },
  {
    name: "Hair Color",
    desc: "Full hair coloring service.",
    price: "$60 - 90 min",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCgc-PiRJAuAJvyDlb9hJYdFmGM7S97BpVEt6T5cs0_x4hlZ7tAKGjGI_JD6WIP_XGfmex9FFwMhyVhcVkAU6yfJgycOC4kCWfOa8GqwAnLhAlqugAozcgfnCXqm1ARJCjl8LUOCjAjYuzqBXh_d_VVCeIsWXQ6rLtcpsDbXzhwskFfuaMqDNh1NXMUGomKQBII1nDR7YKWIlGkG7Iwu0Wb8W1qop0GbH1Si6pBwjTMebCBNEFCoa0ZurEC0aepCsf0Nu_Ds2UuSUI",
  },
  {
    name: "Hair Styling",
    desc: "Specialized styling for any occasion.",
    price: "$40 - 60 min",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBPXqK4fh69sxLw593khpub3RjdEy63rOH7889pUWopRLRF5Oz43mbsc4Un_Fo6SPSHLS36Zd9lCK6ipoTi_BzrHxN6CWVdII5TrJ64EukCj-lYC7qG7BFBn4Um3MKl7ih-8dxjqxW0a4pSNE87umc9eKuv349Ys5q9bH-BnYBVx0gMXiBrM-evThW5dUIM2jfSmAhYJoIWcYz-QFv_7q0m0sEempkOA-reDfy89A0A2bfdd69zaZ65BRaWCRZIc5XTEX73HyiPZLQ",
  },
];

export default function ServiceSelector() {
  return (
    <>
      <h2 className="text-[#0d141c] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
        Services
      </h2>

      {services.map((service, i) => (
        <div key={i} className="p-4">
          <div className="flex items-stretch justify-between gap-4 rounded-lg">
            <div className="flex flex-[2_2_0px] flex-col gap-4">
              <div className="flex flex-col gap-1">
                <p className="text-[#0d141c] text-base font-bold leading-tight">
                  {service.name}
                </p>
                <p className="text-[#49739c] text-sm font-normal leading-normal">
                  {service.desc}
                </p>
              </div>
              <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 flex-row-reverse bg-[#e7edf4] text-[#0d141c] text-sm font-medium leading-normal w-fit">
                <span className="truncate">{service.price}</span>
              </button>
            </div>
            <div
              className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg flex-1"
              style={{ backgroundImage: `url(${service.image})` }}
            ></div>
          </div>
        </div>
      ))}
    </>
  );
}
