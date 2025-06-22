import React, { useEffect, useRef, useState } from 'react'
import uniqid from 'uniqid'
import Quill from 'quill'
import { assets } from '../../assets/assets'


const AddCourse = () => {

  const quillRef = useRef(null)
  const editorRef = useRef(null)

  const [courseTitle,setCourseTitle]=useState('')
  const [coursePrice,setCoursePrice]=useState(0)
  const [discount,setDiscount]=useState(0)
  const [image,setImage]=useState(null)
  const [chapters,setChapters]=useState([])
  const [showPopup,setShowPopup]=useState(false)
  const [currentChapterId,setCurrentChapterId]=useState(null)

  const [lectureDetails, setLectureDetails]=useState(
    {
      lectureTitle:'',
      lectureDuration:'',
      lectureUrl:'',
      isPreviewFree:false,
    }
  )

  const handleChapter = (action, chapterID) => {
  if (action === 'add') {
    const title = prompt('Enter Chapter Name:');
    if (title) {
      const newChapter = {
        chapterID: uniqid(),
        chapterTitle: title,
        chapterContent: [],
        collapsed: false,
        chapterOrder: chapters.length > 0 ? chapters.slice(-1)[0].chapterOrder + 1 : 1,
      };
      setChapters([...chapters, newChapter]);
    }
  } else if (action === 'remove') {
    setChapters(chapters.filter((chapter) => chapter.chapterID !== chapterID));
  } else if (action === 'toggle') {
    setChapters(
      chapters.map((chapter) =>
        chapter.chapterID === chapterID ? { ...chapter, collapsed: !chapter.collapsed } : chapter
      )
    );
  }
};


  const handleLecture = (action, chapterID, lectureIndex) => {
  if (action === 'add') {
    setCurrentChapterId(chapterID);
    setShowPopup(true);
  } else if (action === 'remove') {
    const updatedChapters = chapters.map((chapter) => {
      if (chapter.chapterID === chapterID) {
        return {
          ...chapter,
          chapterContent: chapter.chapterContent.filter((_, index) => index !== lectureIndex),
        };
      }
      return chapter;
    });

    setChapters(updatedChapters); 
  }
};


const handleAddLectureToChapter = () => {
  if (!lectureDetails.lectureTitle || !lectureDetails.lectureDuration || !lectureDetails.lectureUrl) {
    alert("Please fill all the lecture details.");
    return;
  }

  const newLecture = {
    ...lectureDetails,
    lectureDuration: Number(lectureDetails.lectureDuration),
  };

  const updatedChapters = chapters.map((chapter) => {
    if (chapter.chapterID === currentChapterId) {
      return {
        ...chapter,
        chapterContent: [...chapter.chapterContent, newLecture],
      };
    }
    return chapter;
  });

  setChapters(updatedChapters);
  setLectureDetails({
    lectureTitle: '',
    lectureDuration: '',
    lectureUrl: '',
    isPreviewFree: false,
  });
  setShowPopup(false);
};

const handleSubmit=async(e)=>{
  e.preventDefault()
};
  useEffect(()=>{
    //Initiate Quill only once
    if(!quillRef.current && editorRef.current){
      quillRef.current=new Quill(editorRef.current,{
        theme:'snow',
      });
    }
  },[])

  return (
    <div className='h-screen overflow-scroll flex flex-col items-start justify-between md:px-8 md:pb-0 pt-8 pb-0'>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4 max-w-md w-full text-gray-500'>

        <div className='flex flex-col gap-1'>
          <p>Course Title</p>
          <input type="text" onChange={e=> setCourseTitle(e.target.value)} value={courseTitle} placeholder='Type Here' 
          className='outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500' required />
        </div>

        <div className='flex flex-col gap-1'>
          <p>Course Description</p>
          <div ref={editorRef}></div>
        </div>

        <div className='flex items-center justify-between flex-wrap'>
          <div className='flex flex-col gap-1'>
            <p>Course Price</p>
            <input onChange={e=>setCoursePrice(e.target.value)} type="number" value={coursePrice} placeholder='0'
            className='outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-500' required/>
          </div>

          <div className='flex md:flex-row flex-col items-center gap-3'>
            <p>Course Thumbnail</p>
            <label htmlFor="thumbnailImage" className='flex items-center gap-3'>
              <img src={assets.file_upload_icon} alt="" className='p-3 bg-blue-500 rounded'/>
              <input type="file"  id="thumbnailImage" onChange={e=>setImage(e.target.files[0])} accept='image/*' hidden />
              {image && (
                  <img
                    src={URL.createObjectURL(image)}
                    className="max-h-10"
                    alt="Uploaded Preview"
                  />
                )}

            </label>
          </div>
        </div>
        <div className='flex flex-col gap-1'>
          <p>Discount%</p>
          <input type="number" onChange={e=> setDiscount(e.target.value)} value={discount} placeholder='0' 
          min={0} max={100} className='outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-500' />
        </div>

        {/* Adding chapter and lectures */}
        <div>
          {chapters.map((chapter,chapterIndex)=>(
            <div key={chapterIndex} className='bg-white border rounded-lg mb-4'>
              <div className='flex justify-between items-center p-4 border-b'>
                <div className='flex items-center'>
                    <img src={assets.dropdown_icon} width={14} alt="" className={`mr-2 cursor-pointer transition-all ${chapter.collapsed && "-rotate-90"}`} onClick={()=>handleChapter('toggle',chapter.chapterID)}/>
                    <span className='font-semibold'>{chapterIndex+1} {chapter.chapterTitle}</span>
                </div>
                <span className='text-gray-500'>{chapter.chapterContent.length} Lectures</span>
                <img src={assets.cross_icon} alt="" className='cursor-pointer' onClick={()=> handleChapter('remove',chapter.chapterID)}/>
              </div>
              {!chapter.collapsed && (
                <div className='p-4'>
                   {chapter.chapterContent.map((lecture,lectureIndex)=>(
                    <div key={lectureIndex} className='flex justify-between items-center mb-2'>
                        <span>{lectureIndex+1} {lecture.lectureTitle} - {lecture.lectureDuration} mins -<a href={lecture.lectureUrl} target='_blank' 
                        className='text-blue-500'>Link</a> - {lecture.isPreviewFree ? 'Free Preview' : 'Paid'}</span>
                        <img src={assets.cross_icon} alt="" className='cursor-pointer' onClick={()=> handleLecture('remove',chapter.chapterID,lectureIndex)}/>
                    </div>
                   ))}
                   <div className='inline-flex bg-gray-100 p-2 rounded  cursor-pointer mt-2' onClick={()=> handleLecture('add', chapter.chapterID)}> + Add lecture</div>
                </div>
              )}
            </div>
          ))}
          <div className='flex justify-center items-center bg-blue-100 p-2 rounded-lg cursor-pointer' onClick={()=> handleChapter('add')}> + Add Chapter</div>

          {
            showPopup && (
                <div className='fixed inset-0 flex items-center justify-center bg-black/50 z-50'>

                  <div className='bg-white text-gray-700 p-4 rounded relative w-full max-w-80'>
                    <h2 className='text-lg font-semibold mb-4'>Add Lecture</h2>

                    <div className='mb-2'>
                        <p>Lecture Title</p>
                        <input type='text' className='mt-1  block w-full border rounded py-1 px-2'
                        value={lectureDetails.lectureTitle}
                        onChange={(e) => setLectureDetails({...lectureDetails,lectureTitle:e.target.value})}/>
                    </div>
                    <div className='mb-2'>
                        <p>Duration (mins)</p>
                        <input type='number' className='mt-1 block w-full border rounded py-1 px-2'
                        value={lectureDetails.lectureDuration}
                        onChange={(e) => setLectureDetails({...lectureDetails,lectureDuration:e.target.value})}/>
                    </div>

                    <div className='mb-2'>
                        <p>Lecture URL</p>
                        <input type='text' className='mt-1 block w-full border rounded py-1 px-2'
                        value={lectureDetails.lectureUrl}
                        onChange={(e) => setLectureDetails({...lectureDetails,lectureUrl:e.target.value})}/>
                    </div>

                    <div className='mb-2'>
                        <p>Is Preview Free?</p>
                        <input type='checkbox' className='mt-1 scale-125'
                        checked={lectureDetails.isPreviewFree}
                        onChange={(e) => setLectureDetails({...lectureDetails,isPreviewFree:e.target.checked})}/>
                    </div>

                    <button type='button' className='w-full bg-blue-400 text-white px-4 py-2 rounded' onClick={handleAddLectureToChapter}>Add</button>

                    <img src={assets.cross_icon} onClick={()=> setShowPopup(false)} alt="" className='absolute top-4 right-4 w-4 cursor-pointer'/>
                  </div>
                </div>
            )
          }
        </div>

        <button type='submit' className='bg-black text-white w-max py-2.5 px-8 rounded my-4'>ADD</button>
      </form>
    </div>
  )
}

export default AddCourse


// import React, { useEffect, useRef, useState } from 'react';
// import uniqid from 'uniqid';
// import Quill from 'quill';
// import 'quill/dist/quill.snow.css';
// import { assets } from '../../assets/assets';

// const AddCourse = () => {
//   const quillRef = useRef(null);
//   const editorRef = useRef(null);

//   const [courseTitle, setCourseTitle] = useState('');
//   const [coursePrice, setCoursePrice] = useState(0);
//   const [discount, setDiscount] = useState(0);
//   const [image, setImage] = useState(null);
//   const [chapters, setChapters] = useState([]);
//   const [showPopup, setShowPopup] = useState(false);
//   const [currentChapterId, setCurrentChapterId] = useState(null);

//   const [lectureDetails, setLectureDetails] = useState({
//     lectureTitle: '',
//     lectureDuration: '',
//     lectureUrl: '',
//     isPreviewFree: false,
//   });

//   const [newChapterTitle, setNewChapterTitle] = useState('');

//   useEffect(() => {
//     if (!quillRef.current && editorRef.current) {
//       quillRef.current = new Quill(editorRef.current, {
//         theme: 'snow',
//       });
//     }
//   }, []);

//   const addChapter = () => {
//     if (!newChapterTitle.trim()) return;
//     const newChapter = {
//       id: uniqid(),
//       title: newChapterTitle,
//       lectures: [],
//     };
//     setChapters(prev => [...prev, newChapter]);
//     setNewChapterTitle('');
//   };

//   const openLecturePopup = (chapterId) => {
//     setCurrentChapterId(chapterId);
//     setLectureDetails({
//       lectureTitle: '',
//       lectureDuration: '',
//       lectureUrl: '',
//       isPreviewFree: false,
//     });
//     setShowPopup(true);
//   };

//   const addLecture = () => {
//     const updatedChapters = chapters.map(chapter => {
//       if (chapter.id === currentChapterId) {
//         return {
//           ...chapter,
//           lectures: [...chapter.lectures, { ...lectureDetails }],
//         };
//       }
//       return chapter;
//     });
//     setChapters(updatedChapters);
//     setShowPopup(false);
//   };

//   const removeChapter = (id) => {
//   const updated = chapters.filter(chap => chap.id !== id);
//   setChapters(updated);
// };

//   return (
//   <div className='h-screen overflow-scroll flex flex-col items-start justify-between md:px-8 md:pb-0 pt-8 pb-0'>
//     <form className='flex flex-col gap-4 max-w-xl w-full text-gray-700'>

//       <div className='flex flex-col gap-1'>
//         <p>Course Title</p>
//         <input type="text" onChange={e => setCourseTitle(e.target.value)} value={courseTitle} placeholder='Type Here'
//           className='outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500' required />
//       </div>

//       <div className='flex flex-col gap-1'>
//         <p>Course Description</p>
//         <div ref={editorRef} style={{ height: '200px' }} />
//       </div>

//       <div className='flex items-center justify-between flex-wrap gap-4'>
//         <div className='flex flex-col gap-1'>
//           <p>Course Price</p>
//           <input onChange={e => setCoursePrice(e.target.value)} type="number" value={coursePrice} placeholder='0'
//             className='outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-500' required />
//         </div>

//         <div className='flex md:flex-row flex-col items-center gap-3'>
//           <p>Course Thumbnail</p>
//           <label htmlFor="thumbnailImage" className='flex items-center gap-3'>
//             <img src={assets.file_upload_icon} alt="" className='p-3 bg-blue-500 rounded' />
//             <input type="file" id="thumbnailImage" onChange={e => setImage(e.target.files[0])} accept='image/*' hidden />
//             {image && <img src={URL.createObjectURL(image)} className='max-h-10' alt="Preview" />}
//           </label>
//         </div>
//       </div>

//       <div className='flex flex-col gap-1'>
//         <p>Discount %</p>
//         <input type="number" onChange={e => setDiscount(e.target.value)} value={discount} placeholder='0'
//           min={0} max={100} className='outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-500' />
//       </div>

//       {/* Add Chapter */}
//       <div className='flex flex-col gap-2 mt-4'>
//         <p className='font-semibold'>Chapters</p>
//         <div className='flex gap-2'>
//           <input type="text" value={newChapterTitle} onChange={e => setNewChapterTitle(e.target.value)}
//             placeholder='Chapter title' className='border px-3 py-2 rounded w-full' />
//           <button type="button" onClick={addChapter} className='bg-green-500 text-white px-4 py-2 rounded'>Add</button>
//         </div>

//         {chapters.map((chap, index) => (
//           <div key={chap.id} className='bg-gray-100 p-3 rounded mt-2 w-full'>
//             <div className='flex items-center justify-between'>
//               <p className='font-medium'>Chapter {index + 1}: {chap.title}</p>
//               <div className='flex gap-2'>
//                 <button
//                   type="button"
//                   onClick={() => openLecturePopup(chap.id)}
//                   className='text-sm bg-blue-500 text-white px-2 py-1 rounded'
//                 >
//                   + Add Lecture
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => removeChapter(chap.id)}
//                   className='text-sm bg-red-500 text-white px-2 py-1 rounded'
//                 >
//                   Remove
//                 </button>
//               </div>
//             </div>
//             <ul className='list-disc list-inside text-sm mt-2'>
//               {chap.lectures.map((lec, idx) => (
//                 <li key={idx}>
//                   {lec.lectureTitle} ({lec.lectureDuration} min)
//                   {lec.isPreviewFree && ' [Free Preview]'}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         ))}
//       </div>
//     </form>

//     {/* Lecture Popup */}
//     {showPopup && (
//       <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50'>
//         <div className='bg-white p-6 rounded-lg w-full max-w-md'>
//           <h2 className='text-lg font-bold mb-4'>Add Lecture</h2>

//           <div className='flex flex-col gap-2'>
//             <input type="text" placeholder='Lecture Title' className='border px-3 py-2 rounded'
//               value={lectureDetails.lectureTitle} onChange={e => setLectureDetails(prev => ({ ...prev, lectureTitle: e.target.value }))} />
//             <input type="text" placeholder='Duration (mins)' className='border px-3 py-2 rounded'
//               value={lectureDetails.lectureDuration} onChange={e => setLectureDetails(prev => ({ ...prev, lectureDuration: e.target.value }))} />
//             <input type="url" placeholder='Video URL' className='border px-3 py-2 rounded'
//               value={lectureDetails.lectureUrl} onChange={e => setLectureDetails(prev => ({ ...prev, lectureUrl: e.target.value }))} />
//             <label className='flex items-center gap-2'>
//               <input type="checkbox" checked={lectureDetails.isPreviewFree}
//                 onChange={e => setLectureDetails(prev => ({ ...prev, isPreviewFree: e.target.checked }))} />
//               Free Preview
//             </label>
//             <div className='flex justify-end gap-2 mt-3'>
//               <button onClick={() => setShowPopup(false)} className='px-4 py-2 border rounded'>Cancel</button>
//               <button onClick={addLecture} className='px-4 py-2 bg-green-500 text-white rounded'>Add</button>
//             </div>
//           </div>
//         </div>
//       </div>
//     )}
//   </div>
// );
// };

// export default AddCourse;