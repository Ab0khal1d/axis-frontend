import { useEffect, useState } from "react";
import { authService } from "../../auth/services/authService";
import { Avatar } from "@mui/material";



const UserAvatar = () => {
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    authService.getUserAvatar().then(setAvatar).catch(console.error);
  }, []);

  return (
    <Avatar
      src={avatar || "/default-avatar.png"}
      alt="User Avatar"
      // style={{ borderRadius: "50%", width: "64px", height: "64px" }}
      sx={{
        width: 35,
        height: 35,
        mr: 1.5,
        fontSize: '0.8rem',
      }}
    />
  );
};

export default UserAvatar;
