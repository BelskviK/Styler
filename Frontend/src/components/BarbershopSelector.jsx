import AnimatedImage from "@/components/common/AnimatedImage";

export default function BarbershopSelector() {
  const barbershops = [
    {
      name: "The Sharp Edge",
      reviews: "4.8 (120 reviews)",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDBMIvn5OkVuFsRE5cxYgz80aUCk_BzCUoa3o7WKfVKm9P3QvEzoZ4HwdSp2LgNKCh191NV2nOSFV5s73TyuXXzoosK8GefwdOQQHyC-TViXEiW806NFCsmvmuQ8RHP2OPll_oezOaJvGbk5v4Gi4JBOfdjqmZiRDDELZtCtLem65C95WazWCbHZ2u3w0F2rME7vZuXO6ufUI0wGrkQaDHrjB2RaiF6_iT4HWOeFwDkSLL9ayBbBxNYzIgW6a6K732hY9Avp2d1jSg",
    },
    {
      name: "City Style Cuts",
      reviews: "4.7 (95 reviews)",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAY1V1A8uOT3zJVJ-Ht5CuytZnkhznjFO3tU6OGaZDObsBChSlfIn2wbyYhZTLMHqiU12WlqnC08ffBkAmpYjyq8evQzRX3CxpyYMzXB9QlDnxVhJHK6E3-ZPxBZyTxVquwcmZIMHpiNuJfC_iB1UclU2LhkfZqKZNP5Z2JKRfgVqMqwuWa-hWUy4SRgtVD_ChFnIw0WUcLH6BaVRbZrjRel7Zscc-GRem8PO77j55TLynfUbfJZNkgnRtSxSnXpTa_p6erc5IY1_4",
    },
    {
      name: "Urban Grooming Lounge",
      reviews: "4.9 (150 reviews)",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB7kKzfc152_JmeNi8T9YLJFycRvBDOgyJIBUbV9OwWH-GUXlDZwXdknODrrsnmgcSRjNFl7rl1zgGNiI9abQ7fQd2BKHNIdKxkmA7ykjZ4XnNea1ZInb07Y0BXXpvP3RjDIPlePsZhQ7BWg-u1j4wkVtQbU_DOOKKcf11u27k8Rhjsu3nTSQLm3wFbko3trPvo4LguuUqdJWlkYD1QJo4gNxMGDmynMUWTkJq3eQkEMoUqZ0TKXN0wQ7FeDf7uycjKUFBzxlB_SGY",
    },
    {
      name: "Classic Cuts & Shaves",
      reviews: "4.6 (80 reviews)",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCJ6hdQ_r1ly6VE0e0D8BZpB-Gn3Y0rBkpNUwTfIESYadZCmJHhe_D_PBSnfWKnG30wDFO4uoA3NZTmeipwPhrwPkZPz64myYT94lMDJdC9MzlFw0hpFZ8SV-xAgb8eKfsyL_5Un6fAX_TA7sNPTx3Z178Sr-qKk_BE0-BlMfeBLcZDIzpzL7LJSr8Y3WnFBNh24KeexrDXxYmR-J0QaUK2JWFoORhaXs5_P16F8qffx7YCabgbaSu4iwPoy1Qu1iitLOIbj3Ssvys",
    },
  ];

  return (
    <>
      <h3 className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
        Choose a barbershop
      </h3>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
        {barbershops.map((shop, index) => (
          <div key={index} className="flex flex-col gap-3 pb-3">
            <AnimatedImage src={shop.img} alt={shop.name} />
            <div>
              <p className="text-[#0d141c] text-base font-medium leading-normal">
                {shop.name}
              </p>
              <p className="text-[#49739c] text-sm font-normal leading-normal">
                {shop.reviews}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
