import { useQuery } from "@tanstack/react-query";
import { getCurrentUser, signInWithRedirect } from "aws-amplify/auth";
import Dashboard from "@/components/Dashboard";

const Admin = () => {
  const adminCheck = useQuery({
    queryKey: ["initial", "gen2", new Date().toDateString()],
    queryFn: async () => {
      try {
        const user = await getCurrentUser();
        return {
          isAuth: true,
          user,
        };
      } catch (e) {
        return {
          isAuth: false,
          user: null,
        };
      }
    },
    retry: false,
    notifyOnChangeProps: "all",
  });

  if (adminCheck && !adminCheck.data?.isAuth) {
    signInWithRedirect({ provider: { custom: "Midway" } });
    return "Error";
  } else if (adminCheck.isSuccess && adminCheck.data) {
    return <Dashboard />;
  } else if (adminCheck && adminCheck.isError) {
    return "Error";
  } else {
    return "";
  }
};

export default Admin;
