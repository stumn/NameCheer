"use client";

import { io } from "socket.io-client";
const socket = io();

export { io, socket };