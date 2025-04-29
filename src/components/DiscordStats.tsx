import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

import { get } from "aws-amplify/api";

const DiscordStats = () => {
  const query = useQuery({
    queryKey: ["serverstats"],
    queryFn: async (): Promise<{
      approximate_member_count: number;
      approximate_presence_count: number;
    }> => {
      try {
        const req = get({
          apiName: "discordBotApiEnpoint",
          path: "/",
        });

        const res = await req.response;
        console.log("SUCCESS", await res.body.json());
        const data = await res.body.json();
        return data as {
          approximate_member_count: number;
          approximate_presence_count: number;
        };
      } catch (e) {
        console.log(e);
        return e as {
          approximate_member_count: number;
          approximate_presence_count: number;
        };
      }
    },
    retry: false,
  });

  if (query.isSuccess) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-6xl font-bold">
              {query.data?.approximate_member_count}
            </div>
            <p className="text-xs text-muted-foreground">
              +20.1 from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Members Online
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-6xl font-bold">
              {query.data?.approximate_presence_count}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  return query.status;
};

export default DiscordStats;
