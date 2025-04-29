import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import { amplifyClient } from "@/main";
import { useQuery } from "@tanstack/react-query";

import { BarChartView } from "./BarChartView";
import QuestionListByTag from "./QuestionListByTag";
type QuestionsDataProps = {
  dateRange: DateRange;
};
const QuestionsData: React.FC<QuestionsDataProps> = ({ dateRange }) => {
  console.log("render");
  const getQuestions = async (dateRangeFilter: DateRange) => {
    const result = await amplifyClient.models.Question.list({
      authMode: "userPool",
      filter: {
        createdAt: {
          between: [
            dateRangeFilter.from?.toISOString() as string,
            dateRangeFilter.to?.toISOString() as string,
          ],
        },
      },
    });

    console.log(result);
    return result;
  };

  const initQuery = useQuery({
    queryKey: ["initial", "gen2", dateRange],
    queryFn: async () => await getQuestions(dateRange),
    retry: false,
    notifyOnChangeProps: "all",
  });

  if (initQuery.isError) {
    return (
      <>
        <div>SOMETHINGS WRONG</div>
      </>
    );
  }
  if (initQuery.isLoading) {
    return (
      <div>
        <div className="border border-blue-300 shadow rounded-md p-4 max-w-sm w-screen mx-auto">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-6 py-1">
              <div className="h-2 bg-slate-200 rounded"></div>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                  <div className="h-2 bg-slate-200 rounded col-span-1"></div>
                </div>
                <div className="h-2 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (initQuery.isSuccess) {
    const groupedData = initQuery.data.data.reduce((groups, item) => {
      const tags = JSON.parse(item.tags!);
      // console.log({ tags });
      if (tags) {
        tags.forEach((tag: string) => {
          // @ts-expect-error - Element implicitly has an 'any' type
          (groups[tag] || (groups[tag] = [])).push(item);
        });
        return groups;
      } else {
        return {};
      }

      // console.log({ groups });

      // return groups;
    }, {});

    return (
      <>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {initQuery.data.data.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Answered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {initQuery.data.data.filter((q) => q.answered === "yes").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unanswered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {initQuery.data.data.filter((q) => q.answered === "no").length}
              </div>
            </CardContent>
          </Card>
        </div>
        <br />
        <Card>
          <CardHeader>
            <CardTitle className="text-left">Overview by Tag</CardTitle>
          </CardHeader>
          <CardContent>
            {" "}
            <BarChartView data={groupedData} />{" "}
          </CardContent>
        </Card>
        <br />
        <Card>
          <CardHeader>
            <CardTitle className="text-left">Questions by Tag</CardTitle>
          </CardHeader>
          <CardContent>
            <QuestionListByTag groupedQuestions={groupedData} />
          </CardContent>
        </Card>
      </>
    );
  }

  return null;
};

export default QuestionsData;
