"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export const SsoCallbackHandler = () => <AuthenticateWithRedirectCallback />;
