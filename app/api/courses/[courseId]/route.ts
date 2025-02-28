import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Mux from "@mux/mux-node"
import { isTeacher } from "@/lib/teacher";

const {video} = new Mux(
    process.env.MUX_TOKEN_ID!,
    process.env.MUX_TOKEN_SECRET!,
)

export async function DELETE(
    req:Request,
    {params}:{params:{courseId:string}}
){
    try {
        const { userId} = auth();
        if(!userId){
            return new NextResponse("Unuthorized",{status: 401})
        }
        const course = await prisma.course.findUnique({
            where: {
                id: params.courseId,
                userId: userId
            },
            include:{
                chapters: {
                    include:{
                        muxData:true
                    }
                }
            }
        })
        if(!course){
            return new NextResponse("Not found", {status:404})
        }
        for(const chapter of course.chapters){
            if(chapter.muxData?.assetId){
                await video.assets.delete(chapter.muxData.assetId )
            }
        }
        const deletedCourse = await prisma.course.delete({
            where: {
                id: params.courseId
            }
        })
        return NextResponse.json( deletedCourse );
    } catch (error) {
        console.log("Course_id_delete", error)
        return new NextResponse("Internal Error", {status:500})
    }

}

// PATCH

export async function PATCH(
    req:Request,
    {params}: {params:{courseId:string}}
) {
    try {
        const { userId} = auth();
        const { courseId } = params
        const values = await req.json()

        if(!userId){
            return new NextResponse("Unuthorized",{status: 401})
        }
        const course = await prisma.course.update({
            where:{
                id: courseId,
                userId
            },
            data: {
                ...values
            }
        })
        return NextResponse.json(course)
    } catch (error) {
        console.log("[COURSE_ID]", error);
        return new NextResponse("Internal Server Error",{ status: 500})
    }
}