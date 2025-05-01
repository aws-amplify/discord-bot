import {
  // addDays,
  format,
} from "date-fns";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import DiscordStats from "@/components/DiscordStats";
import QuestionsData from "@/components/QuestionsData";
import { useState } from "react";
import { amplifyClient } from "@/main";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
const initialDate = new Date();
const initialDateRange: DateRange = {
  from: new Date(initialDate.getFullYear(), initialDate.getMonth(), 1),
  to: initialDate,
};

const disabledDays = [
  {
    from: new Date(
      initialDate.getFullYear(),
      initialDate.getMonth(),
      initialDate.getDate() + 1
    ),
    to: new Date(2030, 12, 31),
  },
];

const Dashboard = () => {
  const [date, setDate] = useState<DateRange | undefined>(initialDateRange);
  const [queryDateRange, setQueryDateRange] = useState<DateRange | undefined>(
    initialDateRange
  );

  const handleDateChange = (e: DateRange | undefined) => {
    if (e && e.to) {
      setQueryDateRange(e);
    }
    setDate(e);
  };
  return (
    <>
      <br />
      <DiscordStats />
      <hr className="my-8" />
      <div className="flex items-center justify-between space-y-2 my-8">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <div className={cn("grid gap-2")}>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-[260px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={handleDateChange}
                  numberOfMonths={2}
                  disabled={disabledDays}
                />
              </PopoverContent>
            </Popover>
          </div>
          {/* <Button>Download</Button> */}
        </div>
      </div>

      <QuestionsData dateRange={queryDateRange as DateRange} />
      <hr />
      <Users />
    </>
  );
};

export default Dashboard;

const Users = () => {
  const getUsers = async () => {
    const res = await amplifyClient.models.DiscordUser.list({
      authMode: "userPool",
    });

    return res.data;
  };

  const users = useQuery({
    queryKey: ["user", "stats"],
    queryFn: async () => await getUsers(),
  });

  if (users && users.isSuccess) {
    return (
      <Card className="my-4">
        <CardHeader>
          <CardTitle className="text-left">Answers by Users</CardTitle>
        </CardHeader>
        <CardContent>
          {users.data.map((u) => {
            return (
              <div key={u.id}>
                <p>
                  {u.name} - {u.answers?.length}
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  }
  return <></>;
};
