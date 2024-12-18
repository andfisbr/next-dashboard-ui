//
//
//
import FormModal from "@/components/FormModal"
import Pagination from "@/components/Pagination"
import Table from "@/components/Table"
import TableSearch from "@/components/TableSearch"
import { resultsData, role } from "@/lib/data"
import prisma from "@/lib/prisma"
import { ITEMS_PER_PAGE } from "@/lib/settings"
import { Prisma, Result } from "@prisma/client"
import Image from "next/image"
import Link from "next/link"


type ResultList = {
        id: number;
        title: string;
        studentName: string;
        studentSurname: string;
        teacherName: string;
        teacherSurname: string;
        score: number;
        className: string;
        startTime: Date;
        type: string
}


const columns = [
        {
                header: "Title",
                accessor: "title",
        },
        {
                header: "Class",
                accessor: "class",
                className: "hidden md:table-cell",
        },
        {
                header: "Teacher",
                accessor: "teacher",
                className: "hidden md:table-cell",
        },
        {
                header: "Student",
                accessor: "Student",
                className: "hidden md:table-cell",
        },
        {
                header: "Date",
                accessor: "date",
                className: "hidden md:table-cell",
        },
        {
                header: "Type",
                accessor: "type",
                className: "hidden md:table-cell",
        },
        {
                header: "Score",
                accessor: "score",
                className: "hidden md:table-cell",
        },
        {
                header: "Actions",
                accessor: "action",
        }
]


const renderRow = (item: ResultList) => {
        return (
                <tr key={item.id} className="border-b border-gray-200 text-sm even:bg-slate-50 hover:bg-lamaPurpleLight">
                        <td className="flex items-center gap-4 p-4">
                                <h3 className="font-semibold">{item.title}</h3>
                        </td>
                        <td className="hidden md:table-cell">{item.className}</td>
                        <td className="hidden md:table-cell">{item.teacherName + " " + item.teacherSurname}</td>
                        <td className="hidden md:table-cell">{item.studentName + " " + item.studentSurname}</td>
                        <td className="hidden md:table-cell">{new Intl.DateTimeFormat("pt-BR").format(item.startTime)}</td>
                        <td className="hidden md:table-cell">{item.type}</td>
                        <td className="hidden md:table-cell">{item.score}</td>
                        <td>
                                <div className="flex items-center gap-2">
                                        {role === "admin" && (
                                                <>
                                                <FormModal table="result" type="update" data={item} />
                                                <FormModal table="result" type="delete" id={item.id} />
                                                </>
                                        )}
                                </div>
                        </td>
                </tr>
        )
}


const ResultListPage = async ({
        searchParams,
}: {
        searchParams: { [key: string]: string | undefined };
}) => {

        const { page, ...queryParams } = searchParams;
        const p = page ? parseInt(page) : 1;

        const query: Prisma.ResultWhereInput = {}

        if (queryParams) {
                for (const [key, value] of Object.entries(queryParams)) {
                        if (value === undefined) {
                                continue
                        }

                        switch (key) {
                                case "search":
                                        query.OR = [
                                                { exam: { title: { contains: value, mode: "insensitive" } } },
                                                { student: { name: { contains: value, mode: "insensitive" } } },
                                        ]
                                        break

                                case "studentId":
                                        query.studentId = value
                                        break

                                default:
                                        break
                        }
                }
        }


        const [dataResponse, count] = await prisma.$transaction([
                prisma.result.findMany({
                        where: query,
                        include: {
                                student: { select: { name: true, surname: true } },
                                exam: {
                                        include: {
                                                lesson: {
                                                        select: {
                                                                class: { select: { name: true } },
                                                                teacher: { select: { name: true, surname: true } }
                                                        },
                                                },
                                        },
                                },
                                assignment: {
                                        include: {
                                                lesson: {
                                                        select: {
                                                                class: { select: { name: true } },
                                                                teacher: { select: { name: true, surname: true } }
                                                        },
                                                },
                                        },
                                },
                        },
                        take: ITEMS_PER_PAGE,
                        skip: ITEMS_PER_PAGE * (p - 1),
                }),

                prisma.result.count({
                        where: query
                })
        ])


        const data = dataResponse.map((it) => {
                const assessment = it.exam || it.assignment
                if (!assessment) {
                        return null
                }

                const isExam = "startTime" in assessment

                return {
                        id: it.id,
                        title: assessment.title,
                        studentName: it.student.name,
                        studentSurname: it.student.surname,
                        teacherName: assessment.lesson.teacher.name,
                        teacherSurname: assessment.lesson.teacher.surname,
                        score: it.score,
                        className: assessment.lesson.class.name,
                        startTime: isExam ? assessment.startTime : assessment.startDate,
                        type: isExam ? "Exam" : "Assignment",
                }
        })


        return (
                <div className="bg-white p-4 rounded-md flex-1 m-4- mt-0">
                        {/* TOP */}
                        <div className="flex items-center justify-between">
                                <div className="hidden md:block text-lg font-semibold">
                                        All results
                                </div>
                                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                                        <TableSearch />
                                        <div className="flex items-center gap-4 self-end">
                                                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow ">
                                                        <Image src="/filter.png" alt="" width={14} height={14} />
                                                </button>
                                                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow ">
                                                        <Image src="/sort.png" alt="" width={14} height={14} />
                                                </button>
                                                {role === "admin" && (
                                                        // <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow ">
                                                        //         <Image src="/plus.png" alt="" width={14} height={14} />
                                                        // </button>
                                                        <FormModal table="result" type="create" />
                                                )}
                                        </div>
                                </div>
                        </div>

                        {/* LIST */}
                        <Table columns={columns} renderRow={renderRow} data={data} />

                        {/* PAGINATION */}
                        <Pagination page={p} count={count} />
                </div>
        )
}


export default ResultListPage
