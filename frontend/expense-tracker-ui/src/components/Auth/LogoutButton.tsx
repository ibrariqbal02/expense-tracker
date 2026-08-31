

import { useNavigate } from "react-router-dom";
import { useLogout } from "../../hooks/auth.hook";

export default function LogoutButton() {
  const { mutate: logout, isPending } = useLogout();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
       
        navigate("/login");
      },
    });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50"
    >
      {isPending ? "Logging out..." : "Log Out"}
    </button>
  );
}