import { getAuth,clerkClient } from '@clerk/express'
import { get } from 'mongoose';
import { RetryScheduleInOut } from 'svix'

//update role to educator
export const updateRoleToEducator = async (req, res)=>{
    try {
        const  userId  = req.auth.userId

        await clerkClient.users.updateUserMetadata(userId,{
            publicMetadata:{
                role: 'educator',
            }
        })
        res.json({success: true, message: 'You can publish a course now'})

    } catch (error) {
        res.json({success: false, message: error.message })
    }
}