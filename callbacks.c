#ifdef HAVE_CONFIG_H
#  include <config.h>
#endif

#include <gtk/gtk.h>
#include<stdio.h>
#include<stdlib.h>
#include<string.h>
#include "callbacks.h"
#include "interface.h"
#include "support.h"
#include "fonction.h"
#include "tree.h"



int btnradioconv=0;
int validmodif=0;


void
on_gestionouvrier_clicked              (GtkButton       *button,
                                        gpointer         user_data)
{
GtkWidget *p,  *p2 ,*p3;
GtkWidget *window2, *windowo;

windowo= create_window1();


p=lookup_widget(windowo,"treeview1");

p2=lookup_widget(windowo,"treeview2");
p3=lookup_widget(windowo,"treeview3");

Afficherouvrier(p,"users.txt");
Afficherouvrier1(p2,"users.txt");
afficherabsence(p3,"absenteisme.txt");



window2=lookup_widget(button,"window2");

gtk_widget_hide(window2);
gtk_widget_show(windowo);

}



void
on_quitter_clicked                     (GtkButton       *button,
                                        gpointer         user_data)
{

}


void
on_ajouter_clicked                     (GtkButton       *button,
                                        gpointer         user_data)
{
GtkWidget  *entrycin, *entrynom, *entryprenom, *entrynumtel, *entrysalaire, *entrysexe, *CIN, *NOM, *PRENOM, *TEL ,*success , *fail , *p ,*p2 ,*p3, *p4; 

ouvrier o ;
absenteisme a ;
a.pjan =0;
a.pfev =0;
a.pmar =0;
a.pav=0;
a.pmai=0;
a.pjuin=0;
a.pjuil=0;
a.paout=0;
a.psept=0;
a.poct=0;
a.pnov=0;
a.pdec=0; 


p=lookup_widget(button,"treeview1");
p3=lookup_widget(button,"treeview2");
p4=lookup_widget(button,"treeview3");
//entries
entrycin=lookup_widget(button,"entrycin");
entrynom=lookup_widget(button,"entrynom");
entryprenom=lookup_widget(button,"entryprenom");
entrynumtel=lookup_widget(button,"entrytel");
entrysalaire=lookup_widget(button,"spinbuttonsalaire");
entrysexe=lookup_widget(button,"comboboxsexe");


//labels

CIN=lookup_widget(button,"cin");
NOM=lookup_widget(button,"nom");
PRENOM=lookup_widget(button,"prenom");
TEL=lookup_widget(button,"tel");
fail=lookup_widget(button,"labelexiste");
success=lookup_widget(button,"label11");

//récuperation des données 

strcpy(o.cin, gtk_entry_get_text(GTK_ENTRY(entrycin)));
strcpy(o.nom, gtk_entry_get_text(GTK_ENTRY(entrynom)));
strcpy(o.prenom, gtk_entry_get_text(GTK_ENTRY(entryprenom)));
strcpy(o.tel, gtk_entry_get_text(GTK_ENTRY(entrynumtel)));
strcpy(o.sexe,gtk_combo_box_get_active_text(GTK_COMBO_BOX(entrysexe)));
o.salaire=gtk_spin_button_get_value_as_int(GTK_SPIN_BUTTON(entrysalaire));
strcpy(a.nom, gtk_entry_get_text(GTK_ENTRY(entrynom)));
strcpy(a.cin, gtk_entry_get_text(GTK_ENTRY(entrycin)));


//controle de saisie 
if(strcmp(o.cin,"")==0)
{
gtk_widget_show(CIN);
gtk_widget_set_visible(success,FALSE);

}
else
{
gtk_widget_set_visible(CIN,FALSE);
gtk_widget_set_visible(success,FALSE);

}
if(strcmp(o.nom,"")==0)
{
gtk_widget_show(NOM);
gtk_widget_set_visible(success,FALSE);

}
else
{
gtk_widget_set_visible(NOM,FALSE);
gtk_widget_set_visible(success,FALSE);

}

if(strcmp(o.prenom,"")==0)
{
gtk_widget_show(PRENOM);
gtk_widget_set_visible(success,FALSE);

}
else
{
gtk_widget_set_visible(PRENOM,FALSE);
gtk_widget_set_visible(success,FALSE);
}

if(strcmp(o.tel,"")==0)
{
gtk_widget_show(TEL);
gtk_widget_set_visible(success,FALSE);

}
else
{
gtk_widget_set_visible(TEL,FALSE);
gtk_widget_set_visible(success,FALSE);

}
if(gtk_widget_get_visible(CIN)==FALSE && gtk_widget_get_visible(NOM)==FALSE && gtk_widget_get_visible(PRENOM)==FALSE && gtk_widget_get_visible(TEL)==FALSE)
{
         if(exist(o.cin)==1)
{
	gtk_widget_set_visible(success,FALSE);
	gtk_widget_show(fail);
        Afficherouvrier (p,"users.txt");
        Afficherouvrier1(p3,"users.txt");
        afficherabsence(p4,"absenteisme.txt");
}
       

 else {

	
         ajouter(o,a);
         //bien ajouté 
	gtk_widget_set_visible(fail,FALSE);
	gtk_widget_show(success);
	//vider les champs après ajout
	gtk_entry_set_text(GTK_ENTRY(entrycin),"");
	gtk_entry_set_text(GTK_ENTRY(entrynom),"");
	gtk_entry_set_text(GTK_ENTRY(entryprenom),"");
        gtk_entry_set_text(GTK_ENTRY(entrynumtel),"");
	gtk_spin_button_set_value(GTK_SPIN_BUTTON(entrysalaire),500);
        //mise à jour du treeview 
       p2=lookup_widget(button,"treeview1");
	Afficherouvrier(p2,"users.txt");
        Afficherouvrier1(p3,"users.txt");
        afficherabsence(p4,"absenteisme.txt");
	}
}
}



void
on_treeview_row_activated             (GtkTreeView     *treeview,
                                        GtkTreePath     *path,
                                        GtkTreeViewColumn *column,
                                        gpointer         user_data)
{


}

void
on_modifier2_clicked                   (GtkButton       *button,
                                        gpointer         user_data)
{
GtkTreeSelection *selection;
        GtkTreeModel     *model;
        GtkTreeIter iter;
        gchar* cin;
GtkWidget *entrynom, *entryprenom,*labelvalid, *entrytel, *entrysexe, *entrysalaire, *success,  *p , *p2;
ouvrier ov;

//les labels
success=lookup_widget(button,"success");

//entries

entrynom=lookup_widget(button,"entrynom1");
entryprenom=lookup_widget(button,"entryprnom1");
entrytel=lookup_widget(button,"entrytel1");
entrysalaire=lookup_widget(button,"spinbuttonsalaire2");
entrysexe=lookup_widget(button,"comboboxsexe2");
labelvalid=lookup_widget(button,"labelvalid");


//Récuperation 
strcpy(ov.nom, gtk_entry_get_text(GTK_ENTRY(entrynom)));


strcpy(ov.prenom, gtk_entry_get_text(GTK_ENTRY(entryprenom)));
strcpy(ov.tel, gtk_entry_get_text(GTK_ENTRY(entrytel)));
ov.salaire=gtk_spin_button_get_value_as_int(GTK_SPIN_BUTTON(entrysalaire));
strcpy(ov.sexe,gtk_combo_box_get_active_text(GTK_COMBO_BOX(entrysexe)));

         p2=lookup_widget(button,"treeview2");
	p=lookup_widget(button,"treeview1");
        selection = gtk_tree_view_get_selection(GTK_TREE_VIEW(p));
        if (gtk_tree_selection_get_selected(selection, &model, &iter))
        {  
		
                gtk_tree_model_get (model,&iter,0,&cin,-1);
		gtk_widget_show(labelvalid);
                modifier(ov, cin );
		//mise à jour du treeview
		Afficherouvrier(p,"users.txt");
                Afficherouvrier1(p2,"users.txt");
		if (validmodif==1)
		{
		//bien modifié
		gtk_widget_hide(labelvalid);
		gtk_widget_show(success);}
		//vider les champs après modification
		gtk_entry_set_text(GTK_ENTRY(entrynom),"");
		gtk_entry_set_text(GTK_ENTRY(entryprenom),"");
		gtk_entry_set_text(GTK_ENTRY(entrytel),"");
		gtk_spin_button_set_value(GTK_SPIN_BUTTON(entrysalaire),500);
		
		}
}


void
on_supprimer1_clicked                  (GtkButton       *button,
                                        gpointer         user_data)
{
GtkTreeSelection *selection;
        GtkTreeModel     *model;
        GtkTreeIter iter;
        GtkWidget* p1  , *p2;
        gchar* cin;

        p1=lookup_widget(button,"treeview1");
        selection = gtk_tree_view_get_selection(GTK_TREE_VIEW(p1));
        if (gtk_tree_selection_get_selected(selection, &model, &iter))
        {  gtk_tree_model_get (model,&iter,0,&cin,-1);
           gtk_list_store_remove(GTK_LIST_STORE(model),&iter);//supprimer la ligne du treeView

          supprimer(cin);
          p2=lookup_widget(button,"treeview2");
          Afficherouvrier1(p2,"users.txt");
        }

}

void
on_chercher_clicked                    (GtkButton       *button,
                                        gpointer         user_data)
{
GtkWidget *p1;
GtkWidget *entry;
GtkWidget *labelnom;
GtkWidget *nbResultat;
GtkWidget *message;
char nom[30];
char chnb[30];
int b=0,nb;
entry=lookup_widget(button,"entrynom2");
labelnom=lookup_widget(button,"labelnom2");
p1=lookup_widget(button,"treeview2");
strcpy(nom,gtk_entry_get_text(GTK_ENTRY(entry)));

if(strcmp(nom,"")==0)
{
  gtk_widget_show (labelnom);b=0;
}
else
{
b=1;
gtk_widget_hide (labelnom);
}

if(b==0)
{
return;
}
else
{

nb=Chercherouvrier(p1,"users.txt",nom);
/* afficher le nombre de resultats obtenue par la recherche */
sprintf(chnb,"%d",nb);//conversion int==> chaine car la fonction gtk_label_set_text naccepte que chaine
nbResultat=lookup_widget(button,"nb");
message=lookup_widget(button,"msgres");
gtk_label_set_text(GTK_LABEL(nbResultat),chnb);

gtk_widget_show (nbResultat);
gtk_widget_show (message);

}
}


void
on_radiobutton1_toggled                (GtkToggleButton *togglebutton,
                                        gpointer         user_data)
{

}


void
on_buttonvalider_clicked               (GtkButton       *button,
                                        gpointer         user_data)
{
GtkTreeSelection *selection;
        GtkTreeModel     *model;
        GtkTreeIter iter;
        gchar* cin;
GtkWidget *entrymois, *prst,  *p ;
absenteisme a;
char mois[30], presence[30];


p=lookup_widget(button,"treeview3");
selection = gtk_tree_view_get_selection(GTK_TREE_VIEW(p));
        if (gtk_tree_selection_get_selected(selection, &model, &iter))
        {  
		
                gtk_tree_model_get (model,&iter,0,&cin,-1);}
recuperer(a,cin);

prst=lookup_widget(button,"comboboxentry4");
entrymois=lookup_widget(button,"comboboxmois");



strcpy(mois,gtk_combo_box_get_active_text(GTK_COMBO_BOX(entrymois)));
strcpy(presence,gtk_combo_box_get_active_text(GTK_COMBO_BOX(prst)));


if (strcmp (presence,"Absent(e)")==0 && strcmp(mois,"Janvier")==0 ){
          
                a.pjan= a.pjan+1;}


else  {a.pjan=a.pjan;} 



if(  strcmp (presence,"Absent(e)")==0       &&  strcmp(mois,"Fevrier")==0)
               {a.pfev=a.pfev+1;}


else {a.pfev=a.pfev;}
 



if(strcmp (presence,"Absent(e)")==0   && strcmp(mois,"Mars")==0)
                              {a.pmar=a.pmar+1;}
else 

         {a.pmar=a.pmar;}
     

if (strcmp (presence,"Absent(e)")==0 && strcmp(mois,"Avril")==0)
                      {a.pav=a.pav+1;}

      else 
                 {a.pav=a.pav;}

 

if(strcmp (presence,"Absent(e)")==0   && strcmp(mois,"Mai")==0)
               {a.pmai=a.pmai+1;}
else       
               {a.pmai=a.pmai;}


if(strcmp (presence,"Absent(e)")==0     && strcmp(mois,"Juin")==0)
               {a.pjuin=a.pjuin+1;}

else       {a.pjuin=a.pjuin;}

if(strcmp (presence,"Absent(e)")==0    && strcmp(mois,"Juillet")==0)
               {a.pjuil=a.pjuil + 1 ;}

else
             {a.pjuil=a.pjuil;}

if(strcmp (presence,"Absent(e)")==0         && strcmp(mois,"Aout")==0)

               {a.paout=a.paout+1;} 

else                {a.paout=a.paout;} 
             
 
if(strcmp (presence,"Absent(e)")==0    && strcmp(mois,"Septembre")==0)
               {a.psept=a.psept+1;} 
    
else     {a.psept=a.psept ;}

if(strcmp (presence,"Absent(e)")==0  &&  strcmp(mois,"October")==0)
               {a.poct=a.poct+1;}
else             {a.poct=a.poct;}

if(strcmp (presence,"Absent(e)")==0      &&  strcmp(mois,"Novembre")==0)
               {a.pnov=a.pnov+1;}
else     {a.pnov=a.pnov;}


if(strcmp (presence,"Absent(e)")==0   && strcmp(mois,"Decembre")==0)
               {a.pdec=a.pdec+1;}
else 
                    {a.pdec=a.pdec;}



    
                
                marquer(a,cin );
		//mise à jour du treeview
		
		afficherabsence(p,"absenteisme.txt");

}


void
on_radiobuttonoui_toggled              (GtkToggleButton *togglebutton,
                                        gpointer         user_data)
{
if ( gtk_toggle_button_get_active(GTK_RADIO_BUTTON (togglebutton)))
{btnradioconv=1;}
}


void
on_radiobuttonnon_toggled              (GtkToggleButton *togglebutton,
                                        gpointer         user_data)
{
if ( gtk_toggle_button_get_active(GTK_RADIO_BUTTON (togglebutton)))
{btnradioconv=2;}
}


void
on_checkbutton2_toggled                (GtkToggleButton *togglebutton,
                                        gpointer         user_data)
{
if ( gtk_toggle_button_get_active(GTK_CHECK_BUTTON (togglebutton)))
{validmodif=1;}
else
{validmodif=0;}
}

