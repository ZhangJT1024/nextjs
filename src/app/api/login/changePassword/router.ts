import { NextRequest, NextResponse } from 'next/server';
import {LoginService} from "@/services/login.service"
import {debugger_logger} from "@/lib/logger"
/**
 * 接口层 (Interface Layer - Route Handler)
 * 职责：处理带有 ID 参数的请求，如 DELETE 或 PUT。
 */

const loginService = new LoginService();