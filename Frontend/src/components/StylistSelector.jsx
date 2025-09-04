import React from "react";

const stylists = [
  {
    name: "Ethan",
    desc: "Specializes in fades",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBQsIlF6VDMWVm6V-gzEYWvpxNvFn2rJUKXMV4-nnd2xRlohBwkG1OcIkj1vQhGiMLJnJiGaHgo2NbtBldP97ev_GipzeY7BbiY3kcXIRG1g3Q1gR0FAmWaVkOjNyMVNH6yT1H-bJUUB21OMqUqS7pzsBSfnqzdPwVZPsdg1QymERpMNqnM1mAKNshm3czU2XxpJxU3YtHviJxGLg_rsuFj_g0kfwxqShaDd5g6TXHUWF663d2uo0MPGZ-ExBG62mqnAnMPuWBPLL4",
  },
  {
    name: "Liam",
    desc: "Expert in classic cuts",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCUIuh_FWpYUjqUHtSRaEU4OgOn1F35dgna6PfSPnHV1XlFOI-p5UKAWYKbQXmEZ6WxKE6ndpxshuWNXnauNmFAePFLPCYX7Z7QkWzBY6gsKzLqKVDlYkYuZbDbKn0x2t4r3ukedN_DH0xibFcBijIqMcyzjgLlZiT48E-HeVKpYqcrwk_6obQeakCKkc0NdMDm6KwG0MfhCUPytKHNk5Pw84lAHt3WByLX3fU9I1Xh7oVpabQ6LMWN93ZbfcdXh3hwsjk5k0U5zPs",
  },
  {
    name: "Noah",
    desc: "Master of modern styles",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC2s67VgNiBH2RFFnWW6GkKkFPtC6sClv-RSsELtburB82T8Ro4WmspzEvR5OCZIPZ1j5GZcfuAGAxUraM_uPDvyWcfQtauTvAYXlUrv8DhUeimduu3QTkXDqJcAb9UgoudVYfe3JOq8opLFxuf4MXDehi2PjhkM6gL3A7cGcykf0kSQHIdL34-X66ilYICMFM5btcD42vl6BlFAg-QpeVDKRuWjhO0_8qp9d6Q9kCB6YYbBkuROIPK_Wamq9k6V2qWAIYCdGkW0l4",
  },
  {
    name: "Oliver",
    desc: "Beard trimming specialist",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDTSfabQDumqfEMs90U3TdgD4zTKcgg2pOKuTt4FpdfuUtsEY4TzzkNHndquAWShMzgWOb1xe5n2mbvqTDSfcp1RAbT7vmkpmVkPsqvNbromVdRoViBkjISAdjiw6lYnY4tkPqtQQqjoIEf_bJJdhbfa6rJmVYSHL7hZP7tJrvrx8-9IfmE1SEcmbpC2Ek4XGgCnQbfVT2wn8QsJ-NPc4Pwr8EF6soJes2B80Id1cXTM19OaULv53s-OFjciWXh-m1rnZA_qTDS9Mw",
  },
];

export default function StylistSelector() {
  return (
    <section>
      <h3 className="text-lg font-bold text-[#0d141c] px-4 pb-2">
        Select a stylist
      </h3>
      <div className="flex overflow-x-auto gap-8 p-4 scrollbar-hide">
        {stylists.map((stylist, i) => (
          <div
            key={i}
            className="flex flex-col gap-4 min-w-32 text-center cursor-pointer"
          >
            <div
              className="aspect-square w-full bg-cover bg-center rounded-full"
              style={{ backgroundImage: `url(${stylist.image})` }}
            />
            <div>
              <p className="text-base font-medium">{stylist.name}</p>
              <p className="text-sm text-[#49739c]">{stylist.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
