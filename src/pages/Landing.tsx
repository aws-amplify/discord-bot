import { amplifyClient } from "@/main";
import { useQuery } from "@tanstack/react-query";

const Landing = () => {
  const getQuestions = async () => {
    const result = await amplifyClient.models.Question.list({
      authMode: "iam",
    });

    console.log(result);
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
    return initQuery.data.data.map((question) => (
      <div key={question.id}>
        <h1>{question.title}</h1>
      </div>
    ));
  } else {
    return "Loading...";
  }
};

export default Landing;
