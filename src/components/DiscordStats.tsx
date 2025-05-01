import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { amplifyClient } from "@/main";
import { useQuery } from "@tanstack/react-query";

const DiscordStats = () => {
  const fetchStats = async () => {
    try {
      const r = await amplifyClient.queries.serverStats();

      return r.data;
    } catch (e) {}
  };
  const query = useQuery({
    queryKey: ["serverstats"],
    queryFn: async () => await fetchStats(),

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
            <div className="text-6xl font-bold">{query.data?.members}</div>
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
            <div className="text-6xl font-bold">{query.data?.presence}</div>
          </CardContent>
        </Card>
      </div>
    );
  }
  return query.status;
};

export default DiscordStats;
