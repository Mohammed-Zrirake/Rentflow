/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Get,
  Put,
  Body,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AgencyService } from './agency.service';
import {
  RawAgencySettingsDto,
  apiAgencySettingsValidator,
} from './dto/update-agency-settings.dto';
import { ZodError } from 'zod';


interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  agencyId: string;
}
interface AuthenticatedRequest extends Request {
  user: { agencyId: string };
}

@Controller('agency')
@UseGuards(AuthGuard('jwt')) 
export class AgencyController {
  constructor(private readonly agencyService: AgencyService) {}


  @Get('my-agency')
  getMyAgency(@Req() req: AuthenticatedRequest) {
    return this.agencyService.findOneById(req.user.agencyId);
  }

  @Get('settings')
  async getSettings(@Req() req: { user: AuthenticatedUser }) {
    return this.agencyService.getSettings(req.user.agencyId);
  }

  @Put('settings')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'logo', maxCount: 1 },
        { name: 'tampon', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './uploads', 
          filename: (req, file, cb) => {
            const uniqueSuffix =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
            cb(null, filename);
          },
        }),
        fileFilter: (req, file, cb) => {
          if (file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
            cb(null, true); // Accept file
          } else {
            cb(
              new BadRequestException(
                'Only image files (JPG, PNG, WEBP) are allowed.',
              ),
              false, // Reject file
            );
          }
        },
      },
    ),
  )
  async updateSettings(
    @Req() req: { user: AuthenticatedUser },
    @Body() body: RawAgencySettingsDto, // Use the DTO type for better type-safety
    @UploadedFiles()
    files: { logo?: Express.Multer.File[]; tampon?: Express.Multer.File[] },
  ) {
    let validatedData: RawAgencySettingsDto;

    try {
      // Use the DTO's Zod schema to validate the incoming form body.
      // This schema correctly expects French names and coerces numbers.
      validatedData = apiAgencySettingsValidator.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        // Return a structured error response that the frontend can use
        throw new BadRequestException({
          message: 'Validation failed',
          errors: error.flatten().fieldErrors,
        });
      }
      // Fallback for other unexpected errors
      throw new BadRequestException('Invalid form data.');
    }

    const logoUrl = files?.logo?.[0]?.filename
      ? `/uploads/${files.logo[0].filename}`
      : undefined;
    const stampUrl = files?.tampon?.[0]?.filename
      ? `/uploads/${files.tampon[0].filename}`
      : undefined;

    // Call the service with the agencyId from the token and the validated data
    return this.agencyService.updateSettings(
      req.user.agencyId,
      validatedData,
      logoUrl,
      stampUrl,
    );
  }

  
}
