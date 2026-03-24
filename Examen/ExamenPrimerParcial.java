package Examen;

import java.util.Scanner;

public class ExamenPrimerParcial {

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        System.out.println("¿Qué deseas hacer?");
        System.out.println("1. Calcular media, moda y mediana");
        System.out.println("2. Salir");
        System.out.print("Opción: ");

        int opcion = sc.nextInt();

        if (opcion == 2) {
            System.out.println("Gracias por usar el programa");
            sc.close();
            return;
        }

        if (opcion != 1) {
            System.out.println("Opción no válida");
            sc.close();
            return;
        }


        double[] numeros = new double[100];
        int cantidad = 0;

        System.out.println("\nIngresa los números (positivo o negativo).");
        System.out.println("Escribe 0 para terminar:");

        while (true) {
            double num = sc.nextDouble();
            if (num == 0) break;
            numeros[cantidad] = num;
            cantidad++;
        }

        if (cantidad == 0) {
            System.out.println("No ingresaste ningún número.");
            sc.close();
            return;
        }

        double suma = 0;
        for (int i = 0; i < cantidad; i++) {
            suma += numeros[i];
        }
        double media = suma / cantidad;


        for (int i = 0; i < cantidad - 1; i++) {
            for (int j = 0; j < cantidad - i - 1; j++) {
                if (numeros[j] > numeros[j + 1]) {
                    double temp = numeros[j];
                    numeros[j] = numeros[j + 1];
                    numeros[j + 1] = temp;
                }
            }
        }


        double mediana;
        if (cantidad % 2 == 0) {
            mediana = (numeros[cantidad/2 - 1] + numeros[cantidad/2]) / 2.0;
        } else {
            mediana = numeros[cantidad/2];
        }


        double moda = numeros[0];
        int maxRep = 1;

        for (int i = 0; i < cantidad; i++) {
            int rep = 0;
            for (int j = 0; j < cantidad; j++) {
                if (numeros[i] == numeros[j]) {
                    rep++;
                }
            }
            if (rep > maxRep) {
                maxRep = rep;
                moda = numeros[i];
            }
        }

        String textoModa = (maxRep == 1) ? "No hay moda" : "" + moda;

        System.out.print("Nombre completo: ");
        sc.nextLine();         
        String nombre = sc.nextLine();

        System.out.print("Año de nacimiento (ej: 2005): ");
        int año = sc.nextInt();

        int edad = 2026 - año;

        if (edad < 18) {
            System.out.println("\nLo siento " + nombre + ",");
            System.out.println("Este programa solo puede usarse si eres mayor de 18 años.");
            System.out.println("Los resultados han sido descartados.");
        } else {
            System.out.println("Tienes " + edad + " años.");

            System.out.println("Media   = " + media);
            System.out.println("Mediana = " + mediana);
        
            System.out.println("Moda    = " + textoModa);
        }

        System.out.println("\n¡Adiós!");
        sc.close();
    }
}