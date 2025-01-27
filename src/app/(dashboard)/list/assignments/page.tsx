//
//
//
import FormContainer from "@/components/FormContainer"
import FormModal from "@/components/FormModal"
import Pagination from "@/components/Pagination"
import Table from "@/components/Table"
import TableSearch from "@/components/TableSearch"
import prisma from "@/lib/prisma"
import { ITEMS_PER_PAGE } from "@/lib/settings"
import { getRole, getUserId } from "@/lib/utils"
import { Assignment, Class, Prisma, Subject, Teacher } from "@prisma/client"
import Image from "next/image"
import Link from "next/link"


type AssignmentList = Assignment & {
        lesson: {
                subject: Subject,
                class: Class,
                teacher: Teacher,
        }
}



const AssingmentListPage = async ({
        searchParams,
}: {
        searchParams: { [key: string]: string | undefined };
}) => {

        const columns = [
                {
                        header: "Subject",
                        accessor: "subject",
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
                        header: "Due Date",
                        accessor: "date",
                        className: "hidden md:table-cell",
                },
                ...(
                        getRole() === "admin" || getRole() === "teacher"
                                ? [{
                                        header: "Actions",
                                        accessor: "actions",
                                }]
                                : []
                )
        ]


        const renderRow = (item: AssignmentList) => {
                return (
                        <tr key={item.id} className="border-b border-gray-200 text-sm even:bg-slate-50 hover:bg-lamaPurpleLight">
                                <td className="flex items-center gap-4 p-4">
                                        {item.lesson.subject.name}
                                </td>
                                <td>
                                        {item.lesson.class.name}
                                </td>
                                <td className="hidden md:table-cell">
                                        {item.lesson.teacher.name + " " + item.lesson.teacher.surname}
                                </td>
                                <td className="hidden md:table-cell">
                                        {new Intl.DateTimeFormat("pt-BR").format(item.dueDate)}
                                </td>
                                <td>
                                        <div className="flex items-center gap-2">
                                                {(getRole() === "admin" || getRole() === "teacher") && (
                                                        <>
                                                                <FormContainer table="assignment" type="update" data={item} />
                                                                <FormContainer table="assignment" type="delete" id={item.id} />
                                                        </>
                                                )}
                                        </div>
                                </td>
                        </tr>
                )
        }


        const { page, ...queryParams } = searchParams;
        const p = page ? parseInt(page) : 1;

        const query: Prisma.AssignmentWhereInput = {}
        query.lesson = {}


        if (queryParams) {
                for (const [key, value] of Object.entries(queryParams)) {
                        if (value === undefined) {
                                continue
                        }

                        switch (key) {
                                case "search":
                                        query.lesson.subject = { name: { contains: value, mode: "insensitive" } }
                                        break

                                case "classId":
                                        query.lesson.classId = parseInt(value)
                                        break

                                case "teacherId":
                                        query.lesson.teacherId = value
                                        break

                                default:
                                        break
                        }
                }
        }


        // ROLE CONDITIONS
        switch (getRole()) {
                case "admin":
                        break

                case "teacher":
                        query.lesson.teacherId = getUserId()
                        break

                case "student":
                        query.lesson.class = {
                                students: {
                                        some: { id: getUserId() }
                                }
                        }
                        break

                case "parent":
                        query.lesson.class = {
                                students: {
                                        some: { parentId: getUserId() }
                                }
                        }
                        break

                default:
                        break
        }






        const [data, count] = await prisma.$transaction([
                prisma.assignment.findMany({
                        where: query,
                        include: {
                                lesson: {
                                        select: {
                                                subject: { select: { name: true } },
                                                teacher: { select: { name: true, surname: true } },
                                                class: { select: { name: true } },
                                        },
                                }
                        },
                        take: ITEMS_PER_PAGE,
                        skip: ITEMS_PER_PAGE * (p - 1),
                }),

                prisma.assignment.count({
                        where: query
                })
        ])



        return (
                <div className="bg-white p-4 rounded-md flex-1 m-4- mt-0">
                        {/* TOP */}
                        <div className="flex items-center justify-between">
                                <div className="hidden md:block text-lg font-semibold">
                                        All assignments ({count})
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
                                                {(getRole() === "admin" || getRole() == "teacher") && (
                                                        <FormContainer table="assignment" type="create" />
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


export default AssingmentListPage
