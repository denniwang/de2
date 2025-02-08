import FetchDataSteps from "@/components/tutorial/fetch-data-steps";
import { createClient } from "@/utils/supabase/server";
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";
// import { useEffect } from "react";
import { validTickets } from "./tickets/types";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }
  const { data, error } = await supabase.auth.getSession();
  const accessToken = data.session?.provider_token;
  console.log("Access Token", accessToken);
  const response = await fetch("http://localhost:3000/api/getAllGitProjects", {
    method: "POST",
    body: JSON.stringify({
      githubToken: accessToken,
      githubUsername: user.user_metadata.user_name,
    }),
  });
  const gitProjects = await response.json();
  console.log("Git Projects", gitProjects);

  // useEffect(() => {
  //   // Clear the valid tickets if the user returns to the upload screen
  //   validTickets.length = 0;
  // }, []);

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          This is a protected page that you can only see as an authenticated
          user
        </div>
      </div>
      <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-2xl mb-4">Your user details</h2>
        <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
      <div>
        <h2 className="font-bold text-2xl mb-4">Next steps</h2>
        <FetchDataSteps />
      </div>
    </div>
  );
}
