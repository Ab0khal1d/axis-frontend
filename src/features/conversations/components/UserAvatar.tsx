import { Avatar } from "@mui/material";
import { useAppSelector } from "../../../redux/hook";
import { selectUserPhoto } from "../../auth/redux/authSelectors";



const UserAvatar = () => {
  const userPhoto = useAppSelector(selectUserPhoto);

  return (
    <Avatar
      src={userPhoto || "/default-avatar.png"}
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
