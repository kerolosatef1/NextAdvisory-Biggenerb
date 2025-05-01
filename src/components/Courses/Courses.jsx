import { useState, useEffect, Fragment } from "react";

import axios from "axios";
import {
  
  Input,
  Option,
  Select,
  Button,
  Dialog,
  Textarea,
  IconButton,
  Typography,
  DialogBody,
  DialogHeader,
  DialogFooter,
  ThemeProvider,
}from "@material-tailwind/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const GetCourses = () => {
  const [editCourses, setEditCourses] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const queryClient = useQueryClient();

  const [message, setMessage] = useState("");
  
  const [course, setCourse] = useState({
    name: "",
    grops: "",      
    grop_lap: "", 
    year: "",
    enrollment: ""
  });
  const resetForm = () => {
    setCourse({ name: "", grops: "", grop_lap: "", year: "" , enrollment: ""});
    setIsEdit(false);
    setEditCourses(null);
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
  
  
    if (["grops", "grop_lap", "year","enrollment"].includes(name)) {
      if (!/^\d*$/.test(value)) return;
    }
  
    setCourse((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // استبدال دالة handleSubmit القديمة بهذا الكود
const mutation = useMutation({
  mutationFn: async (payload) => {
    const token = localStorage.getItem("userToken");
    const url = isEdit 
      ? `https://timetableapi.runasp.net/api/Courses/${editCourses.id}`
      : "https://timetableapi.runasp.net/api/Courses";
    
    const method = isEdit ? axios.put : axios.post;
    
    const { data } = await method(url, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  },
  onSuccess: () => {
    queryClient.invalidateQueries(['courses']);
    setMessage("✅ تم حفظ التغييرات بنجاح");
    resetForm();
    handleOpen();
    
  },
  onError: (error) => {
    setMessage(`❌ حدث خطأ: ${error.response?.data?.message || "يرجى المحاولة لاحقًا"}`);
  }
});

const handleSubmit = (e) => {
  e.preventDefault();
  const payload = {
    name: course.name.trim(),
    grops: parseInt(course.grops, 10),
    grop_lap: parseInt(course.grop_lap, 10),
    year: parseInt(course.year, 10),
    enrollment: parseInt(course.enrollment, 10)
  };
  mutation.mutate(payload);
};
  


  const [search, setSearch] = useState("");
  
  const [errorMessage, setErrorMessage] = useState("");
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(!open);

// استبدال useEffect القديم بهذا الكود
const { data: courses = [], isLoading, isError, error } = useQuery({
  queryKey: ['courses'],
  queryFn: async () => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      setErrorMessage("❌ Token not found"); // هنا نستخدم errorMessage
      throw new Error('Token not found');
    }
    const { data } = await axios.get(
      "https://timetableapi.runasp.net/api/Courses",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );
    return data;
  }
});


// استبدال useEffect الخاص بالبحث بهذا السطر
const filteredCourses = courses?.filter(c => 
  c.name?.toLowerCase().includes(search.toLowerCase())
) || []; 
// استبدال دالة handleDelete القديمة بهذا الكود
const deleteMutation = useMutation({
  mutationFn: async (id) => {
    const token = localStorage.getItem("userToken");
    await axios.delete(
      `https://timetableapi.runasp.net/api/Courses/${id}`,
      { 
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );
  },
  onSuccess: () => {
    queryClient.invalidateQueries(['courses']);
    setMessage("✅ Deleted successfully");
  },
  onError: (error) => {
    setMessage(`❌ خطأ في الحذف: ${error.response?.data?.message}`);
  }
});

const handleDelete = (id) => {
  if (window.confirm("هل أنت متأكد من الحذف؟")) {
    deleteMutation.mutate(id);
  }
};
 

  return <>
    
   
   <div className="background-main-pages p-11">
    <div className="max-w-screen-xl mx-auto rounded-md bg-slate-800 px-4 sm:px-6 ">
    
    <div className="flex justify-end  ">
  <Button onClick={handleOpen} variant="gradient" className="bg-blue-700">
    Add Courses
  </Button>
</div>
      <Dialog size="sm"  open={open} handler={handleOpen} className="p-4">
        <DialogHeader className="relative m-0 block">
          <Typography variant="h4" color="blue-gray">
            Enter Courses
          </Typography>
          <IconButton
           size="sm"
           variant="text"
           className="!absolute right-3.5 top-3.5"
            onClick={handleOpen}
          >
            <XMarkIcon className="h-4 w-4 stroke-2" />
          </IconButton>
        </DialogHeader>
        <DialogBody className="space-y-4 pb-6">
          <div>
            <Typography
              variant="small"
              color="blue-gray"
              className="mb-2 text-left font-medium"
            >
              Name Course
            </Typography>
            <Input
              color="gray"
              size="lg"
              placeholder="Math1..."
              name="name"
              value={course.name}
              onChange={handleChange}
              className="placeholder:opacity-100 focus:!border-t-gray-900"
              containerProps={{
                className: "!min-w-full",
              }}
              labelProps={{
                className: "hidden",
              }}
            />
          </div>
          <div>
  <Typography variant="small" color="blue-gray" className="mb-2 text-left font-medium">
    Number of groups (normal)
  </Typography>
  <Input
    color="gray"
    size="lg"
    name="grops"
    value={course.grops}
    onChange={handleChange}
    placeholder="مثال: 4"
    containerProps={{ className: "!min-w-full" }}
    className="placeholder:opacity-100 focus:!border-t-gray-900"
    labelProps={{ className: "hidden" }}
  />
</div>
          
          
          <div>
            <Typography
              variant="small"
              color="blue-gray"
              className="mb-2 text-left font-medium"
            >
              Number of groups sections
            </Typography>
            <Input
              color="gray"
              size="lg"
              name="grop_lap"
              value={course.grop_lap}
              onChange={handleChange}
              placeholder="مثال: 3"
              containerProps={{ className: "!min-w-full" }}
              
              className="placeholder:opacity-100 focus:!border-t-gray-900"
              labelProps={{
                className: "hidden",
              }}
            />
          </div>
          <div>
    <Typography
      variant="small"
      color="blue-gray"
      className="mb-2 text-left font-medium"
    >
      Enrollment
    </Typography>
    <Input
      color="gray"
      size="lg"
      name="enrollment"
      value={course.enrollment}
      onChange={handleChange}
      placeholder="مثال: 100"
      containerProps={{ className: "!min-w-full" }}
      className="placeholder:opacity-100 focus:!border-t-gray-900"
      labelProps={{ className: "hidden" }}
    />
  </div>
          <div>
            <Typography
              variant="small"
              color="blue-gray"
              className="mb-2 text-left font-medium"
            >
              year
            </Typography>
            <Select
  color="gray"
  size="lg"
  name="year"
  value={course.year}
  onChange={(val) => handleChange({ target: { name: "year", value: val } })}
  placeholder="مثال: 1"
  containerProps={{ className: "!min-w-full" }}
  className="placeholder:opacity-100 focus:!border-t-gray-900"
  labelProps={{ className: "hidden" }}
>
  {[...Array(6)].map((_, i) => (
    <Option key={i + 1} value={String(i + 1)}>
      {i + 1}
    </Option>
  ))}
</Select>

            
          </div>
          
          
        </DialogBody>
        <DialogFooter>
          <Button
  className="ml-auto text-black"
  onClick={handleSubmit}
  disabled={mutation.isPending}
>
{mutation.isPending ? "SAVING...." : "Submmit"}
          </Button>
        </DialogFooter>
      </Dialog>
    <Fragment>
   
      <div className="text-center">
      <input
        type="text"
        placeholder="🔍 Search Courses Name "
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className=" mt-5  w-3/5 p-2 border rounded mb-4"
      /></div>
      <div className="flex flex-col ">
        <div className="-m-1.5 overflow-x-auto">
          <div className="p-1.5 min-w-full inline-block align-middle">
            <div className="overflow-hidden ">
              <table className="min-w-full divide-y  divide-gray-200 dark:divide-neutral-700">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-start text-xs font-medium  text-white uppercase dark:text-neutral-500"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-start text-xs font-medium text-white uppercase dark:text-neutral-500"
                    >
                     Groups
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-start text-xs font-medium text-white uppercase dark:text-neutral-500"
                    >
                      Lab Sections
                    </th>
                    <th scope="col"className="px-6 py-3 text-start text-xs font-medium text-white uppercase dark:text-neutral-500"
    >
                        Enrollment
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-start text-xs font-medium text-white uppercase dark:text-neutral-500"
                    >
                      Year
                    </th>
                    <th
                      scope="col" 
                      className="px-6 py-3 text-end text-xs font-medium text-white uppercase dark:text-neutral-500"
                    >
                      Action
                    </th>
                    <th
                      scope="col" 
                      className="px-6 py-3 text-end text-xs font-medium text-white uppercase dark:text-neutral-500"
                    >
                      
                      Action
                    </th>
                  </tr>
                </thead>
              
                <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
  {isLoading ? (
    <tr>
      <td colSpan="5" className="text-center py-4 text-white">
        جاري التحميل...
      </td>
    </tr>
  ) : isError ? (
    <tr>
      <td colSpan="5" className="text-center py-4 text-red-500">
        {error.message}
      </td>
    </tr>
  ) : filteredCourses.length === 0 ? (
    <tr>
      <td colSpan="5" className="text-center py-4 text-white">
        لا توجد نتائج
      </td>
  
      
    </tr>
  ) : (
    filteredCourses.map((course) => (
      <tr key={course.id} className="hover:bg-black dark:hover:bg-neutral-700">
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white dark:text-red-500">
          {course.name}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white dark:text-red-500">
          {course.grops}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white dark:text-red-500">
          {course.grop_lap}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
        {course.enrollment}
      </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white dark:text-red-500">
          {course.year}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
          <button
            type="button"
            onClick={() => {
              setIsEdit(true);
              setEditCourses(course);
              setCourse({
                name: course.name,
                grops: course.grops.toString(),
                grop_lap: course.grop_lap.toString(),
                year: course.year.toString(),
                enrollment: course.enrollment.toString() 
              });
              setOpen(true);
            }}
            className="inline-flex items-center gap-x-2 text-lg font-semibold rounded-lg border border-transparent text-blue-500 hover:text-blue-800 focus:outline-hidden focus:text-blue-800 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-400 dark:focus:text-blue-400"
          >
            Edit
          </button>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
          <button
            type="button"
            className="inline-flex items-center gap-x-2 text-lg font-semibold rounded-lg border border-transparent text-red-600 hover:text-blue-800 focus:outline-hidden focus:text-blue-800 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-400 dark:focus:text-blue-400"
            onClick={() => handleDelete(course.id)}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "جاري الحذف..." : "حذف"}
          </button>
        </td>
      </tr>
    ))
  )}
</tbody>
</table>
                
               
            </div>
          </div>
        </div>
      </div>
      
    </Fragment>
    
    </div>
    </div>
    </>
};
XMarkIcon
export default GetCourses;
