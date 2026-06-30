import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export interface UserBehaviorLog {
  user_id: string | number
  product_id: number
  action: 'view' | 'click' | 'purchase' | 'cart_add'
  timestamp: string
  metadata?: Record<string, any>
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    if (!data.user_id || !data.product_id || !data.action) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 插入用户行为日志（用于后续的协同过滤推荐）
    const sql = `
      INSERT INTO user_behaviors (user_id, product_id, action, timestamp, metadata)
      VALUES (?, ?, ?, UNIX_TIMESTAMP(), ?)
    `

    const [result] = await db.query(sql, [
      data.user_id,
      data.product_id,
      data.action,
      JSON.stringify(data.metadata || {})
    ])

    return NextResponse.json({
      success: true,
      insertedId: result.insertId as number
    })
  } catch (error) {
    console.error('记录用户行为失败:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 获取用户历史行为（用于推荐）
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: '缺少 userId 参数' },
        { status: 400 }
      )
    }

    const sql = `
      SELECT user_id, product_id, action, timestamp
      FROM user_behaviors
      WHERE user_id = ?
      ORDER BY timestamp DESC
      LIMIT 50
    `

    const [rows] = await db.query(sql, [userId])

    return NextResponse.json({
      success: true,
      data: rows.map((row: any) => ({
        userId: row.user_id,
        productId: row.product_id,
        action: row.action,
        timestamp: new Date(row.timestamp * 1000).toISOString()
      }))
    })
  } catch (error) {
    return NextResponse.json(
      { error: '查询失败' },
      { status: 500 }
    )
  }
}
