import { Controller, Get, Headers, Put } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  getHello(@Headers() headers): string {
    console.log(headers);
    return this.appService.getHello();
  }

  @Put('/')
  put(@Headers() headers): string {
    console.log(headers);
    return '{"method": "PUT"}';
  }

  @Get('/request')
  request(@Headers() headers): string {
    console.log(headers);
    return `<!DOCTYPE html>
    <html lang="en">

    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script>
        console.log("---start---");

        fetch("http://localhost:3000/", {
          method: "PUT",
          headers: {
          },
        })
          .then((res) => res.json())
          .then((data) => console.log(data));

        console.log("---end---");
      </script>
      <title>Document</title>
    </head>

    <body>
      <p>Hello, World!</p>
    </body>

    </html>
    `;
  }
}
