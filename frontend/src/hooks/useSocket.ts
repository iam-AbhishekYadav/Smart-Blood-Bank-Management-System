import { useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";
import { getApiBaseUrl, loadAuth } from "@/lib/auth";

export const useSocket = () => {
  const auth = loadAuth();
  const [socket, setSocket] = useState<Socket | null>(null);

  const shouldConnect = useMemo(() => Boolean(auth?.accessToken), [auth?.accessToken]);

  useEffect(() => {
    if (!shouldConnect || !auth?.accessToken) return;

    const instance = io(getApiBaseUrl(), {
      transports: ["websocket"],
      auth: { token: auth.accessToken },
    });

    setSocket(instance);
    return () => {
      instance.disconnect();
      setSocket(null);
    };
  }, [shouldConnect, auth?.accessToken]);

  return socket;
};
