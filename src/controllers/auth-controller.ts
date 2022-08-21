import {Request, Response} from "express";
import {AuthService} from "../domain/auth-service";



export class AuthController{
    constructor(protected  authService: AuthService) {}
    async registrationConfirmation(req: Request, res: Response) {
            const result = await this.authService.confirmEmail(req.body.code)
            if (result) {
                res.sendStatus(204)
            } else {
                res.sendStatus(400)
            }
        }
    async registration(req: Request, res: Response) {
        const newUser=await this.authService.createUserWithConfirmationEmail(req.body.login,req.body.email,req.body.password)
        if (newUser) {
            res.sendStatus(204)
        }else{
            res.sendStatus(400)
        }
    }
    async registrationEmailResending(req: Request, res: Response) {
        const everythingIsCorrect = await this.authService.registrationEmailResending(req.body.email)
        if (everythingIsCorrect){
            res.sendStatus(204)
        }else{
            res.sendStatus(400)
        }
    }
    async login(req: Request, res: Response) {
        const result = await this.authService.checkCredentials(req.body.login, req.body.password,req.ip)
        if (result) {
            const accessToken = result[0]
            const refreshToken = result[1]
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
                maxAge: 2000  * 1000 // 20 seconds
            });
            res.status(200).json({accessToken})
        } else {
            res.sendStatus(401)
        }
    }
    async refreshAllTokens(req: Request, res: Response) {
        const user = await this.authService.checkRefreshTokenCredentials(req.cookies.refreshToken)
        if (user){
            const result = await this.authService.refreshAllTokens(user,req.cookies.refreshToken)
            const accessToken = result[0]
            const newRefreshToken = result[1]
            res.cookie('refreshToken', newRefreshToken, {
                httpOnly: true,
                secure: true,
                maxAge: 2000 * 1000 // 20 seconds
            });
            res.status(200).json({accessToken})
        } else {
            res.sendStatus(401)
        }
    }
    async logout(req: Request, res: Response) {
        const user = await this.authService.checkRefreshTokenCredentials(req.cookies.refreshToken)
        if (user){
            const newRefreshToken = await this.authService.refreshOnlyRefreshToken(user,req.cookies.refreshToken)
            res.cookie('refreshToken', newRefreshToken, {
                httpOnly: true,
                secure: true,
                maxAge: 2000  * 1000 // 20 seconds
            });
            res.sendStatus(204)
        } else {
            res.sendStatus(401)
        }
    }
    async me(req: Request, res: Response) {
        if (req.user?.id){
            const user={
                userId:req.user.id,
                login:req.user.login,
                email:req.user.email,
            }
            res.status(200).json(user)
        } else {
            res.sendStatus(401)
        }
    }
}