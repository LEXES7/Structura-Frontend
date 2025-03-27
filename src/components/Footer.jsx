import { Footer, FooterCopyright, FooterDivider, FooterIcon, FooterLink, FooterLinkGroup, FooterTitle } from 'flowbite-react'
import React from 'react'
import { Link } from 'react-router-dom'
import { BsDribbble, BsFacebook, BsGithub, BsInstagram, BsTwitter } from 'react-icons/bs'

export default function FooterCom() {
  return (
    <Footer container className='border border-t'>
    <div className='w-full max-w-7xl mx-auto'>
        <div className='grid w-full justify-between sm:flex md:grid-cols-1'>

            <div className='mt-5'>

            <Link to='/' className='self-center whitespace-nowrap text-lg sm:text-xl font-semibold dark:text-white'>
            <span className='px-2 py-1 bg-gradient-to-r from-red-500 via-yellow-500 to-gray-600 rounded-lg text-white'>Structura</span>
             </Link>
            </div>
            <div className='grid grid-cols-2 gap-8 mt-4 sm:grid-cols-3 sm:gap-6'>
                <div>
                <FooterLink title='About' />
    
                <FooterLinkGroup col>
                    <FooterLink
                       href='#'
                       target='_blank'
                       rel='noopener noreferrer'
                    >
                        Why us?
                    </FooterLink>

                    <FooterLink
                       href='/about'
                       target='_blank'
                       rel='noopener noreferrer'
                    >
                        More about us
                    </FooterLink>

                </FooterLinkGroup>
                </div>

                <div>
                <FooterTitle title='Follow Us' />
    
                <FooterLinkGroup col>
                    <FooterLink
                       href='https://github.com/LEXES7'
                       target='_blank'
                       rel='noopener noreferrer'
                    >
                        Github
                    </FooterLink>

                    <FooterLink
                       href='https://www.facebook.com/'
                       target='_blank'
                       rel='noopener noreferrer'
                    >
                       Facebook
                    </FooterLink>

                </FooterLinkGroup>
                </div>

                <div>
                <FooterTitle title='Legal' />
    
                <FooterLinkGroup col>
                    <FooterLink
                       href='#'
                       target='_blank'
                       rel='noopener noreferrer'
                    >
                        Privacy
                    </FooterLink>

                    <FooterLink
                       href='#'
                       target='_blank'
                       rel='noopener noreferrer'
                    >
                       Terms & Conditions
                    </FooterLink>

                </FooterLinkGroup>
                </div>
            </div>
        </div>
        <FooterDivider />
        <div className='w-full sm:flex sm:items-center sm:justify-between'>
            
            <FooterCopyright href='#' by="Sachintha" year={new Date().getFullYear()}
            />
            <div className='flex gap-6 sm:mt-0 mt-4 sm:justify-center'>
                <FooterIcon href='https://www.facebook.com/' icon={BsFacebook} />
                <FooterIcon href='https://www.instagram.com/' icon={BsInstagram} />
                <FooterIcon href='#' icon={BsTwitter} />
                <FooterIcon href='https://github.com/LEXES7' icon={BsGithub} />
                <FooterIcon href='#' icon={BsDribbble} />


            </div>
        </div>
    </div>
    
    
    </Footer>
  )
}