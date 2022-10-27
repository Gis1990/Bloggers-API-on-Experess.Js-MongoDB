import {ObjectId} from 'mongodb'
import {BlogsRepository} from "../repositories/blogs-repository";
import {NewBlogClassResponseModel, BlogDBClass, BlogDBClassPagination} from "../types/types";




export class BlogsService {
    constructor(protected blogsRepository: BlogsRepository) {}
    async getAllBlogs(obj:{SearchNameTerm?:string|null,pageNumber?:number,pageSize?:number,sortDirection?:string}): Promise<BlogDBClassPagination> {
        const {SearchNameTerm=null,pageNumber=1,pageSize=10,sortDirection="desc"}=obj
        return  this.blogsRepository.getAllBlogs(SearchNameTerm,Number(pageNumber),Number(pageSize),sortDirection)
    }
    async getBlogById(id: string): Promise<BlogDBClass | null> {
        return this.blogsRepository.getBlogById(id)
    }
    async createBlog(name: string, youtubeUrl: string): Promise<NewBlogClassResponseModel> {
        let blog: BlogDBClass = new BlogDBClass (new ObjectId(),Number((new Date())).toString() ,name, youtubeUrl,new Date())
        const newBlog=await this.blogsRepository.createBlog(blog)
        const {_id,...newBlogRest}=newBlog
        return  newBlogRest
    }
    async updateBlog(id: string, name: string, youtubeUrl: string): Promise<boolean> {
        return  this.blogsRepository.updateBlog(id, name, youtubeUrl)
    }
    async deleteBlog(id: string): Promise<boolean> {
        return  this.blogsRepository.deleteBlogById(id)
    }
}





