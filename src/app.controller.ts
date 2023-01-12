import {
  Body,
  Controller,
  Get,
  Post,
  Redirect,
  Render,
  Session,
} from '@nestjs/common';
import { AppService } from './app.service';
import db from './db';
import * as bcrypt from 'bcrypt';
import UserDataDto from './userdata.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  async index(@Session() session: Record<string, any>) {
    let userName = '';
    if (session.user_id) {
      const [rows]: any = await db.execute(
        'select username from users where id = ?',
        [session.user_id],
      );
      userName = rows[0].username;
    } else {
      userName = 'Guest';
    }

    return { message: 'Welcome to the homepage ' + userName };
  }

  @Get('login')
  @Render('login')
  loginForm() {
    return {};
  }

  @Post('login')
  @Redirect()
  async login(
    @Body() userData: UserDataDto,
    @Session() session: Record<string, any>,
  ) {
    const [rows]: any = await db.execute(
      'select id, username, password from users where username = ?',
      [userData.username],
    );
    if (rows.length == 0) {
      return { url: '/login' };
    }
    if (await bcrypt.compare(userData.password, rows[0].password)) {
      session.user_id = rows[0].id;
      return { url: '/' };
    } else {
      return { url: '/login' };
    }
    return {
      url: '/',
    };
  }

  @Get('register')
  @Render('register')
  registerForm() {
    return {};
  }

  @Post('register')
  @Redirect()
  async register(@Body() userData: UserDataDto) {
    await db.execute('insert into users (username, password) values (?, ?)', [
      userData.username,
      await bcrypt.hash(userData.password, 10),
    ]);
    return {
      url: '/',
    };
  }
}
