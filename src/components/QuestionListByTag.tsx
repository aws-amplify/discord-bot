import { QuestionListByTagProps } from "@/lib/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const QuestionListByTag: React.FC<QuestionListByTagProps> = ({
  groupedQuestions,
}) => {
  // return <pre>{JSON.stringify(groupedQuestions, null, 2)}</pre>;
  return (
    <Accordion type="single" collapsible>
      {Object.keys(groupedQuestions).map((tag, i) => {
        return (
          <AccordionItem key={i} value={tag}>
            <AccordionTrigger className="py-0">
              <div className="grid grid-cols-3 w-full">
                <p className="text-left text-lg py-4 px-4">
                  {tag.toUpperCase()}
                </p>
                <p className="text-left py-4 px-4">
                  {
                    // @ts-expect-error - Element implicitly has an 'any' type
                    groupedQuestions[tag].filter((q) => q.answered === "no")
                      .length
                  }{" "}
                  unanswered
                </p>
                <p
                  className={`text-left py-4 px-4 ${
                    Number(
                      (
                        (Number(
                          // @ts-expect-error - Element implicitly has an 'any' type
                          groupedQuestions[tag].filter(
                            // @ts-expect-error - Element implicitly has an 'any' type
                            (q) => q.answered === "yes"
                          ).length
                        ) /
                          // @ts-expect-error - Element implicitly has an 'any' type
                          Number(groupedQuestions[tag].length)) *
                        100
                      ).toFixed()
                    ) > 80
                      ? "bg-green-300"
                      : "bg-red-400"
                  }`}
                >
                  {(
                    (Number(
                      // @ts-expect-error - Element implicitly has an 'any' type
                      groupedQuestions[tag].filter((q) => q.answered === "yes")
                        .length
                    ) /
                      // @ts-expect-error - Element implicitly has an 'any' type
                      Number(groupedQuestions[tag].length)) *
                    100
                  ).toFixed()}{" "}
                  %
                </p>
              </div>
            </AccordionTrigger>

            <AccordionContent>
              <div className="grid grid-cols-3 my-4 bottom-4 border-cyan-300">
                <span className="font-bold px-4">Title</span>
                <span className="font-bold px-4">Link</span>
                <span className="font-bold px-4">Created On</span>
              </div>
              {
                // @ts-expect-error - Element implicitly has an 'any' type
                groupedQuestions[tag].map((q) => {
                  return (
                    <div
                      className="grid grid-cols-3 my-4 bottom-4 border-cyan-300"
                      key={q.id as string}
                    >
                      <span className="px-4">{q.title}</span>
                      <a
                        className="px-4"
                        href={q.url as string}
                        target="_blank"
                      >
                        View In Discord
                      </a>
                      <span className="px-4">
                        {(q.createdAt as string).split("T")[0]}
                      </span>
                    </div>
                  );
                })
              }
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};

export default QuestionListByTag;
