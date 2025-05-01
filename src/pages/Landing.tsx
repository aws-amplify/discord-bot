import { amplifyClient } from "@/main";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "aws-amplify/auth";
import { Key } from "react";

const Landing = () => {
  // const { isAuthenticated, user } = useAuth();

  const checkAuth = async () => {
    try {
      await getCurrentUser();
      return true;
    } catch (e) {
      return false;
    }
  };

  const initQuery = useQuery({
    queryKey: ["authCheck"],
    queryFn: async () => await checkAuth(),

    retry: false,
    notifyOnChangeProps: "all",
  });

  if (initQuery && initQuery.data) {
    return <Questions isAuth={initQuery.data} />;
  } else {
    return "Loading...";
  }
};

export default Landing;

const Questions = ({ isAuth }: { isAuth: boolean }) => {
  const getQuestions = async () => {
    const result = await amplifyClient.models.Question.list({
      authMode: isAuth ? "userPool" : "iam",
    });

    return result;
  };

  const initQuery = useQuery({
    queryKey: ["initial", "gen2"],
    queryFn: async () => await getQuestions(),

    retry: false,
    notifyOnChangeProps: "all",
  });
  if (initQuery && initQuery.error) {
    return "SOME Error";
  } else if (initQuery && initQuery.data) {
    return (
      <>
        {initQuery.data.data.map((question) => (
          <div key={question.id} className="border-b py-4">
            <div className=" flex justify-between">
              <p className="text-lg font-bold">
                {question.answered === "yes" ? "✅" : "?"} : {question.title}
              </p>
              <p className="">
                <a href={question.url as string} target="_blank">
                  View Thread {"->"}
                </a>
              </p>
            </div>
            <p className="mt-4">
              {JSON.parse(question.tags as string).map((t: string, i: Key) => {
                return (
                  <span
                    className="border rounded-lg px-2 py-1 mr-2 text-xs text-slate-400"
                    key={i}
                  >
                    {t}
                  </span>
                );
              })}
            </p>
            <p></p>
          </div>
        ))}
      </>
    );
  } else {
    return "Loading...";
  }
};
