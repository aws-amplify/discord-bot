import { getCurrentUser, signInWithRedirect } from "aws-amplify/auth";
import Dashboard from "../components/Dashboard";
import { useQuery } from "@tanstack/react-query";

const Admin = () => {
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
  if (initQuery.data === false) {
    signInWithRedirect({ provider: { custom: "Federate" } });
    return <div>Redirecting to login...</div>;
  } else {
    return <Dashboard />;
  }
};

export default Admin;
