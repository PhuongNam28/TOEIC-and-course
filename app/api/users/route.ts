import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server"


async function formatDate(date: Date): Promise<string> {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return `${day}-${month}-${year}`;
}

  
export async function GET(){
      try {
          const {userId} = auth();
  
          if(!userId){
              return new NextResponse('Unauthorized', {status: 401})
          }
  
          const users = await prisma.user.findMany({
          });
  
          // Chuyển đổi kiểu dữ liệu của startDate và endDate từ chuỗi sang Date
          const formattedHotels = await Promise.all(users.map(async (user) => ({
            ...user,
            createdAt: await formatDate(user.createdAt),
            updatedAt: await formatDate(user.updatedAt),
          })));
  
          if (formattedHotels.length > 0) {
              return NextResponse.json(
                  {
                      users: formattedHotels,
                  },
                  { status: 200 }
              );
          } else {
              return NextResponse.json({ msg: "No Users found." }, { status: 404 });
          }
          
      } catch (error) {
          console.log('Error at /api/users/', error)
          return new NextResponse('Internal Server Error', {status: 500})
      }
  }