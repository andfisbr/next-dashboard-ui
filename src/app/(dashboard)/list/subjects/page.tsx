//
//
//
import FormModal from "@/components/FormModal"
import Pagination from "@/components/Pagination"
import Table from "@/components/Table"
import TableSearch from "@/components/TableSearch"
import prisma from "@/lib/prisma"
import { ITEMS_PER_PAGE } from "@/lib/settings"
import { getRole } from "@/lib/utils"
import { Prisma, Subject, Teacher } from "@prisma/client"
import Image from "next/image"


type SubjectList = Subject & { teachers: Teacher[] }


const columns = [
        {
                header: "Subject name",
                accessor: "name",
        },
        {
                header: "Teachers",
                accessor: "teachers",
                className: "hidden md:table-cell",
        },
        ...(
                getRole() === "admin"
                       ? [{
                                header: "Actions",
                                accessor: "action",
                        }]
                        : []
        )
]



const renderRow = (item: SubjectList) => {
        return (
                <tr key={item.id} className="border-b border-gray-200 text-sm even:bg-slate-50 hover:bg-lamaPurpleLight">
                        <td className="flex items-center gap-4 p-4">
                                <h3 className="font-semibold">{item.name}</h3>
                        </td>
                        <td className="hidden md:table-cell">{item.teachers.map(it => it.name).join(",")}</td>
                        <td>
                                <div className="flex items-center gap-2">
                                        {getRole() === "admin" && (
                                                <>
                                                <FormModal table="subject" type="update" data={item} />
                                                <FormModal table="subject" type="delete" id={item.id} />
                                                </>
                                        )}
                                </div>
                        </td>
                </tr>
        )
}


const SubjectListPage = async ({
        searchParams,
}: {
        searchParams: { [key: string]: string | undefined };
}) => {

        const { page, ...queryParams } = searchParams;
        const p = page ? parseInt(page) : 1;

        const query: Prisma.SubjectWhereInput = {}

        if (queryParams) {
                for (const [key, value] of Object.entries(queryParams)) {
                        if (value === undefined) {
                                continue
                        }

                        switch (key) {
                                case "search":
                                        query.name = { contains: value, mode: "insensitive" }
                                        break

                                default:
                                        break
                        }
                }
        }


        const [data, count] = await prisma.$transaction([
                prisma.subject.findMany({
                        where: query,
                        include: {
                                teachers: true,
                        },
                        take: ITEMS_PER_PAGE,
                        skip: ITEMS_PER_PAGE * (p - 1),
                }),

                prisma.subject.count({
                        where: query
                })
        ])


        return (
                <div className="bg-white p-4 rounded-md flex-1 m-4- mt-0">
                        {/* TOP */}
                        <div className="flex items-center justify-between">
                                <div className="hidden md:block text-lg font-semibold">
                                        All subjects ({count})
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
                                                {getRole() === "admin" && (
                                                        // <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow ">
                                                        //         <Image src="/plus.png" alt="" width={14} height={14} />
                                                        // </button>
                                                        <FormModal table="subject" type="create" />
                                                )}
                                        </div>
                                </div>
                        </div>

                        {/* LIST */}
                        <Table columns={columns} renderRow={renderRow} data={data} />

                        {/* PAGINATION */}
                        <Pagination page={p} count={count}/>
                </div>
        )
}


export default SubjectListPage
