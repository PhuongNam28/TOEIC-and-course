import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {prisma} from "@/lib/prisma"
import { request } from 'http';


export async function PUT(
    req: Request,
    {params}: {params: {courseId: string}}
){
    try {
        const {userId} = auth()
        if(!userId) {
            return new NextResponse("Unauthorized",{status: 401})
        }
        const {list} = await req.json()
        const ownCourse = await prisma.course.findUnique({
            where:{
                id: params.courseId,
                userId: userId
            }
            })
        if(!ownCourse)
            {
                return new NextResponse("Unauthorized",{status: 401})
            }
        for(let item of list){
            await prisma.chapter.update({
                where: {id: item.id},
                data: {position: item.position}
            })
        }
        return new NextResponse("Success",{status:200})

    }  catch (error) {
        console.log("Reorder",error)
        return new NextResponse("Internal Server Error",{status:500})
    }
}