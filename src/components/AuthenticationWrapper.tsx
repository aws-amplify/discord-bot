// import { ReactElement } from "react";
// import { getCurrentUser, signInWithRedirect } from "aws-amplify/auth";
// import { useQuery } from "@tanstack/react-query";

// type AuthenticationWrapperProps = {
//   children: Array<ReactElement>;
// };
// export const AuthenticationWrapper: React.FC<AuthenticationWrapperProps> = ({
//   children,
// }) => {
//   const authQuery = useQuery({
//     queryKey: ["auth"],
//     queryFn: async () => {
//       try {
//         const user = await getCurrentUser();
//         return {
//           isAuth: true,
//           user: user,
//         };
//       } catch (e) {
//         return {
//           isAuth: false,
//           user: null,
//         };
//       }
//     },
//   });

//   if (authQuery.isSuccess && !authQuery.data.isAuth) {
//     signInWithRedirect({
//       provider: {
//         custom: "Midway",
//       },
//     });

//     return null;
//   }
//   if (authQuery.isSuccess && authQuery.data.isAuth) {
//     return (
//       <>
//         <p>Success</p>
//         <p>{JSON.stringify(authQuery.data)}</p>
//         {children}
//       </>
//     );
//   }
//   if (authQuery.isError) {
//     return (
//       <>
//         <p>Error</p>
//         <p>{JSON.stringify(authQuery.data)}</p>
//       </>
//     );
//   }
//   //  return <>{children}</>;
// };
