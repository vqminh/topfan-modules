import { FC } from "react";
import { IoCallSharp, IoMail } from "react-icons/io5";
import { useTranslation } from "next-i18next";
import { useUI } from "src/contexts/ui.context";
import { siteSettings } from "@settings/site-settings";

interface Props {
  image?: HTMLImageElement;
}

const ContactInfoBlock: FC<Props> = () => {
  const { isIdol } = useUI();

  const data = [
    {
      slug: `mailto:${isIdol ? "idol" : "support"}@topfan.com`,
      icon: <IoMail />,
      name: "text-email",
      description: "text-email-details",
    },
    {
      slug: `tel:${siteSettings.phone}`,
      icon: <IoCallSharp />,
      name: "text-phone",
      description: "text-phone-details",
    },
  ];

  const { t } = useTranslation("common");
  return (
    <div className="mb-6 lg:border lg:rounded-md border-gray-300 lg:p-7">
      <h4 className="text-2xl md:text-lg font-bold text-heading pb-7 md:pb-10 lg:pb-6 -mt-1">
        {t("text-find-us-here")}
      </h4>
      {data?.map((item: any, index) => (
        <div key={String(index)} className="flex pb-7">
          <div className="flex flex-shrink-0 justify-center items-center p-1.5 border rounded-md border-gray-300 w-10 h-10">
            {item.icon}
          </div>
          <div className="flex flex-col ps-3 2xl:ps-4">
            <h5 className="text-sm font-bold text-heading">{t(item.name)}</h5>
            <a href={item.slug} className="text-sm mt-0">
              {t(item.description)}
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactInfoBlock;
