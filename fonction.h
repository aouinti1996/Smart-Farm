#include<gtk/gtk.h>
#ifndef OUVRIERS_H_
#define OUVRIERS_H_
typedef struct 
{char cin [20] ;
char nom [20] ;
char prenom [20] ;
char tel [20] ;
char sexe [20] ; 
int salaire ;
}ouvrier;


 typedef struct
{char cin[20];
char nom[20];
int pjan;
int pfev;
int pmar;
int pav;
int pmai;
int pjuin;
int pjuil;
int paout;
int psept;
int poct;
int pnov;
int pdec;
}absenteisme; 


void ajouter(ouvrier o, absenteisme a) ;
int exist(char*cin) ;
void supprimer(char*cin) ;
void modifier(ouvrier ov, char*cin );
void marquer(absenteisme a, char*cin );
absenteisme recuperer(absenteisme ab ,char*cin);
#endif
