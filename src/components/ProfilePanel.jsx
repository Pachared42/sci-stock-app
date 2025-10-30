import React, { useEffect, useState } from "react";
import { Box, Typography, Avatar, Divider, Skeleton } from "@mui/material";
import { fetchUserProfile } from "../api/profileApi";

function ProfilePanel() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      try {
        const data = await fetchUserProfile();
        setProfile(data);
      } catch (error) {
        console.error("โหลดข้อมูลโปรไฟล์ไม่สำเร็จ", error);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
          mb: 2,
          p: 2,
        }}
      >
        <Skeleton variant="circular" width={100} height={100} sx={{ mb: 4 }} animation="wave" />
        <Skeleton variant="text" width={120} height={20} animation="wave" />
        <Skeleton variant="text" width={180} height={16} animation="wave" />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box
        sx={{
          p: 2,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Skeleton
          variant="circular"
          width={100}
          height={100}
          sx={{ mb: 4 }}
          animation="wave"
        />
        <Typography variant="body2" color="text.secondary">
          ไม่มีข้อมูลโปรไฟล์
        </Typography>
      </Box>
    );
  }  

  const first_name = profile?.user?.first_name || profile?.firstName || "-";
  const last_name = profile?.user?.last_name || profile?.lastName || "-";
  const gmail = profile?.user?.gmail || profile?.gmail || "-";
  const profile_image =
    profile?.user?.profile_image || profile?.profileImage || null;

  const avatarSrc = profile_image
    ? `data:image/*;base64,${profile_image}`
    : "/default-avatar.png";

  return (
    <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
          mb: 2,
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: 100,
            height: 100,
            mb: 1.5,
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              border: "1px solid transparent",
              borderTop: "3px solid #f50057",
              animation: "spin-ring 10s linear infinite",
              zIndex: 1,
            },
          }}
        >
          <Avatar
            src={avatarSrc}
            alt={`${first_name} ${last_name}`}
            sx={{
              width: 90,
              height: 90,
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 2,
            }}
          />
        </Box>

        <Typography
          variant="h6"
          fontWeight="bold"
          align="center"
          sx={{ mt: 2, fontSize: 14 }}
        >
          {first_name} {last_name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mt: 0.2, fontSize: 12 }}
        >
          {gmail}
        </Typography>
      </Box>
      
      <Divider sx={{ borderStyle: "dashed", mb: 2 }} />

      <style>
        {`
          @keyframes spin-ring {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </Box>
  );
}

export default ProfilePanel;
