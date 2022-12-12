import {ObjectId} from 'mongodb'
import {PostsRepository} from '../repositories/posts-repository'
import {
    ExtendedLikesInfoClass,
    NewPostClassResponseModel,
    PostDBClass,
    PostDBClassPagination,
    UsersLikesInfoClass
} from "../types/types";
import {BlogsRepository} from "../repositories/blogs-repository";



export class PostsService {
    constructor(protected postsRepository: PostsRepository, protected blogsRepository: BlogsRepository) {}
    async getAllPosts(obj:{pageNumber?:number,pageSize?:number,sortBy?:string,sortDirection?:string},userId: string | undefined): Promise<PostDBClassPagination> {
        const {pageNumber=1,pageSize=10,sortBy="adededAt",sortDirection="desc"}=obj
        const allPosts = await this.postsRepository.getAllPosts(Number(pageNumber), Number(pageSize),sortBy,sortDirection);
        if (userId) {
            for (let i = 0; i < allPosts.items.length; i++) {
                allPosts.items[i].extendedLikesInfo.newestLikes = allPosts.items[i].extendedLikesInfo.newestLikes
                    .slice(-3)
                    .sort((a, b) => b.adededAt.getTime() - a.adededAt.getTime());
                allPosts.items[i].extendedLikesInfo.myStatus = await this.postsRepository.returnUsersLikeStatus(
                    allPosts.items[i].id,
                    userId,
                );
            }
        } else {
            allPosts.items.forEach((elem) => (elem.extendedLikesInfo.myStatus = "None"));
            allPosts.items.forEach(
                (elem) =>
                    (elem.extendedLikesInfo.newestLikes = elem.extendedLikesInfo.newestLikes
                        .slice(-3)
                        .sort((a, b) => b.adededAt.getTime() - a.adededAt.getTime())),
            );
        }
        return allPosts;
    }
    async getAllPostsForSpecificBlog(
        obj:{pageNumber?:number,pageSize?:number,sortBy?:string,sortDirection?:string},
        blogId: string,
        userId: string | undefined,
    ): Promise<PostDBClassPagination> {
        const {pageNumber=1,pageSize=10,sortBy="adededAt",sortDirection="desc"}=obj
        const posts = await this.postsRepository.getAllPostsForSpecificBlog(
            Number(pageNumber),
            Number(pageSize),
            blogId,
            sortBy,
            sortDirection
        );
        if (userId) {
            for (let i = 0; i < posts.items.length; i++) {
                posts.items[i].extendedLikesInfo.newestLikes = posts.items[i].extendedLikesInfo.newestLikes
                    .slice(-3)
                    .sort((a, b) => b.adededAt.getTime() - a.adededAt.getTime());
                posts.items[i].extendedLikesInfo.myStatus = await this.postsRepository.returnUsersLikeStatus(
                    posts.items[i].id,
                    userId,
                );
            }
        } else {
            posts.items.forEach(
                (elem) =>
                    (elem.extendedLikesInfo.newestLikes = elem.extendedLikesInfo.newestLikes
                        .slice(-3)
                        .sort((a, b) => b.adededAt.getTime() - a.adededAt.getTime())),
            );
            posts.items.forEach((elem) => (elem.extendedLikesInfo.myStatus = "None"));}
        return posts;
    }
    async getPostById(id: string, userId: string | undefined): Promise<PostDBClass | null> {
        const post = await this.postsRepository.getPostById(id);
        if (!post) {
            return null;
        }
        post.extendedLikesInfo.newestLikes = post?.extendedLikesInfo.newestLikes
            .slice(-3)
            .sort((a, b) => b.adededAt.getTime() - a.adededAt.getTime());
        if (userId) {
            post.extendedLikesInfo.myStatus = await this.postsRepository.returnUsersLikeStatus(id, userId);
        } else {
            post.extendedLikesInfo.myStatus = "None";
        }
        return post;
    }
    async createPost(
        title: string,
        shortDescription: string,
        content: string,
        blogId: string,
    ): Promise<NewPostClassResponseModel> {
        const blog = await this.blogsRepository.getBlogById(blogId);
        let blogName;
        blog ? (blogName = blog.description) : (blogName = "");
        const likesInfo: ExtendedLikesInfoClass = new ExtendedLikesInfoClass(0, 0, "None", []);
        const usersLikesInfo: UsersLikesInfoClass = new UsersLikesInfoClass([], []);
        const post: PostDBClass = new PostDBClass(
            new ObjectId(),
            Number(new Date()).toString(),
            title,
            shortDescription,
            content,
            blogId,
            blogName,
            new Date(),
            likesInfo,
            usersLikesInfo,
        );
        const newPost = await this.postsRepository.createPost(post);
        return (({ id, title, shortDescription, content, blogId, blogName, adededAt, extendedLikesInfo }) => ({
            id,
            title,
            shortDescription,
            content,
            blogId,
            blogName,
            adededAt,
            extendedLikesInfo,
        }))(newPost);
    }
    async updatePost(
        id: string,
        title: string,
        shortDescription: string,
        content: string,
        blogId: string,
    ): Promise<boolean> {
        return this.postsRepository.updatePost(id, title, shortDescription, content, blogId);
    }
    async deletePost(id: string): Promise<boolean> {
        return this.postsRepository.deletePostById(id);
    }
    async likeOperation(id: string, userId: string, login: string, likeStatus: string): Promise<boolean> {
        return this.postsRepository.likeOperation(id, userId, login, likeStatus);
    }
}

