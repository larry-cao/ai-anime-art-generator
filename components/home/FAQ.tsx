"use client";
import { ROUGH_NOTATION_BACKGROUND_COLOR } from "@/config/color";
import { ALL_FAQS } from "@/config/faqs";
import { Accordion, AccordionItem } from "@nextui-org/react";
import { PlusIcon } from "lucide-react";
import { RoughNotation } from "react-rough-notation";
import useStore from '@/stores/useStore';

// update rough notation highlight
function triggerResizeEvent() {
  const event = new Event("resize");
  window.dispatchEvent(event);
}

const FAQ = ({
  id,
  locale,
  langName,
}: {
  id: string;
  locale: any;
  langName: string;
}) => {
  const FAQS = ALL_FAQS[`FAQS_${langName.toUpperCase()}`];

  const { lastPictureId } = useStore();

  return (
    <section
      id={id}
      className="flex flex-col justify-center max-w-[88%] items-center py-16 gap-12"
    >
      <div className="flex flex-col text-center gap-4">
        <h2 className="text-center text-white">
          <RoughNotation
            key={lastPictureId}
            type="highlight"
            show={true}
            color={ROUGH_NOTATION_BACKGROUND_COLOR}
          >
            {locale.title}
          </RoughNotation>
        </h2>
        <p className="text-large text-default-500">{locale.description}</p>
      </div>
      <Accordion
        fullWidth
        keepContentMounted
        className="gap-3"
        itemClasses={{
          base: "px-6 !bg-default-100 !shadow-none hover:!bg-default-200/50",
          title: "font-medium",
          trigger: "py-6",
          content: "pt-0 pb-6 text-base text-default-500",
        }}
        items={FAQS}
        selectionMode="multiple"
        variant="splitted"
        onSelectionChange={triggerResizeEvent}
      >
        {FAQS?.map((item) => (
          <AccordionItem
            key={item.title}
            indicator={<PlusIcon />}
            title={item.title}
          >
            {item.content}
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};

export default FAQ;

